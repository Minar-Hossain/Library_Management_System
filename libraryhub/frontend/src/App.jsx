import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Borrow from "./pages/Borrow";
import Return from "./pages/Return";
import Records from "./pages/Records";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetails />} />
            <Route path="/borrow" element={<Borrow />} />
            <Route path="/return" element={<Return />} />
            <Route path="/records" element={<Records />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Layout>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </BrowserRouter>
    </ThemeProvider>
  );
}
