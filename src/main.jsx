import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import App from './pages/App'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Admin from './pages/Admin'
import Calc from './pages/Calc'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Refund from './pages/Refund'
import NotFound from './pages/NotFound'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/app"     element={<App />} />
        <Route path="/calc"    element={<Calc />} />
        <Route path="/blog"    element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin"   element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms"   element={<Terms />} />
        <Route path="/refund"  element={<Refund />} />
        <Route path="*"        element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
