import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ArticlePage } from './pages/ArticlePage'
import { HomePage } from './pages/HomePage'
import { Footer } from './shared/ui/Footer'

function App() {

  return (
    <BrowserRouter>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  )
}

export default App
