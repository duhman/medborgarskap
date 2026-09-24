import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BehoverJag } from './pages/BehoverJag'
import { Home } from './pages/Home'
import { KapitelIndex } from './pages/KapitelIndex'
import { KapitelStudy } from './pages/KapitelStudy'
import { Integritet } from './pages/Integritet'
import { Om } from './pages/Om'
import { Villkor } from './pages/Villkor'
import { OvningQuiz } from './pages/OvningQuiz'
import { Provfragor } from './pages/Provfragor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="behover-jag" element={<BehoverJag />} />
          <Route path="kapitel" element={<KapitelIndex />} />
          <Route path="kapitel/:slug" element={<KapitelStudy />} />
          <Route path="ovning/:slug" element={<OvningQuiz />} />
          <Route path="provfragor" element={<Provfragor />} />
          <Route path="om" element={<Om />} />
          <Route path="integritet" element={<Integritet />} />
          <Route path="villkor" element={<Villkor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
