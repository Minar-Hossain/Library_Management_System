import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login heading", async () => {
  render(<App />);
  const headingElement = await screen.findByText(/ventures login/i);
  expect(headingElement).toBeInTheDocument();
});
