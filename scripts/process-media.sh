#!/usr/bin/env bash
set -euo pipefail

INPUT_DIR="${1:-media/incoming}"
OUTPUT_DIR="${2:-media/processed}"
MAX_WIDTH="${MAX_WIDTH:-1920}"
MAX_HEIGHT="${MAX_HEIGHT:-1080}"
WEBP_QUALITY="${WEBP_QUALITY:-82}"

mkdir -p "$OUTPUT_DIR"

command -v identify >/dev/null 2>&1 || { echo "ImageMagick identify is required" >&2; exit 1; }
command -v convert >/dev/null 2>&1 || { echo "ImageMagick convert is required" >&2; exit 1; }
command -v ffprobe >/dev/null 2>&1 || { echo "ffprobe is required" >&2; exit 1; }

processed=0
rejected=0

while IFS= read -r -d '' file; do
  rel="${file#"$INPUT_DIR"/}"
  ext="${rel##*.}"
  base="${rel%.*}"
  lower_ext="$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')"
  out_dir="$OUTPUT_DIR/$(dirname "$rel")"
  mkdir -p "$out_dir"

  case "$lower_ext" in
    jpg|jpeg|png)
      output="$OUTPUT_DIR/${base}.webp"
      echo "Processing image: $rel -> ${base}.webp"
      dimensions="$(identify -format '%w %h' "$file")"
      read -r width height <<< "$dimensions"
      if [[ "$width" -lt 1 || "$height" -lt 1 ]]; then
        echo "Invalid image dimensions: $rel" >&2
        rejected=$((rejected + 1))
        continue
      fi
      convert "$file" -auto-orient -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" -strip -quality "$WEBP_QUALITY" "$output"
      verify="$(identify -format '%m %w %h' "$output")"
      [[ "$verify" == WEBP* ]] || { echo "WEBP validation failed: $output" >&2; exit 1; }
      processed=$((processed + 1))
      ;;
    webp)
      output="$OUTPUT_DIR/$rel"
      echo "Normalizing WEBP: $rel"
      convert "$file" -auto-orient -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" -strip -quality "$WEBP_QUALITY" "$output"
      verify="$(identify -format '%m %w %h' "$output")"
      [[ "$verify" == WEBP* ]] || { echo "WEBP validation failed: $output" >&2; exit 1; }
      processed=$((processed + 1))
      ;;
    mp4)
      output="$OUTPUT_DIR/$rel"
      echo "Validating MP4: $rel"
      codec="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$file")"
      [[ "$codec" == "h264" || "$codec" == "hevc" || "$codec" == "av1" ]] || {
        echo "Unsupported MP4 video codec '$codec': $rel" >&2
        rejected=$((rejected + 1))
        continue
      }
      cp -f "$file" "$output"
      ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height -of default=nw=1 "$output" >/dev/null
      processed=$((processed + 1))
      ;;
    *)
      echo "Ignoring unsupported extension: $rel"
      rejected=$((rejected + 1))
      ;;
  esac
done < <(find "$INPUT_DIR" -type f -print0)

echo "Media processing complete: processed=$processed rejected=$rejected"
[[ "$rejected" -eq 0 ]] || exit 2
