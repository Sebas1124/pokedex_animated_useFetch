import { Suspense } from "react"
import { LoaderComponent } from "../components/common"
import { Route, Routes } from "react-router-dom"
import { HomePage } from "../pages"
import { PokemonPage } from "../pages/PokemonPage"

export const AppRouter = () => {


  return (
    <Suspense fallback={<LoaderComponent size="large" color="primary" />}>
        <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/pokemon/:searchTerm" element={<PokemonPage/>} />
        </Routes>
    </Suspense>
  )
}
