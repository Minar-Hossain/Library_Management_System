import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login route", () => {
  render(<App />);
  const headingElement = screen.getByText(/urbanwear login/i);
  expect(headingElement).toBeInTheDocument();
});
