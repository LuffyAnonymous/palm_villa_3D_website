import { LangProvider, useLang } from './ui/lang'
import { site } from './data/villa'
import Navbar from './ui/Navbar'
import Hero from './ui/Hero'
import Configurator from './ui/Configurator'
import Gallery from './ui/Gallery'
import Location from './ui/Location'
import Specs from './ui/Specs'
import Contact from './ui/Contact'
import Projects from './ui/Projects'
import Footer from './ui/Footer'
import LoadingScreen from './ui/LoadingScreen'

function Page() {
  const { t } = useLang()
  return (
    <>
      <LoadingScreen />
      <a className="skip" href="#layouts">{t(site.a11y.skip)}</a>
      <Navbar />
      <Hero />
      <main>
        <Configurator />
        <Gallery />
        <Location />
        <Specs />
        <Contact />
        <Projects />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Page />
    </LangProvider>
  )
}
