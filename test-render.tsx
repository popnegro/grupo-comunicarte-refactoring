import React from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Home from './src/pages/Home';

try {
  const html = renderToString(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  if (html.includes("Soportes destacados")) {
    console.log("SUCCESS: Renders Soportes destacados");
  } else {
    console.log("FAIL: Does not render");
  }
} catch (e) {
  console.error("ERROR rendering:", e);
}
