import HeroSection from '@presentation/components/sections/HeroSection'
import AboutSection from '@presentation/components/sections/AboutSection'
import ExperienceSection from '@presentation/components/sections/ExperienceSection'
import MotivationSection from '@presentation/components/sections/MotivationSection'
import SkillsSection from '@presentation/components/sections/SkillsSection'
import MakerSection from '@presentation/components/sections/MakerSection'
import ProjectsSection from '@presentation/components/sections/ProjectsSection'
import BooksSection from '@presentation/components/sections/BooksSection'
import ContactSection from '@presentation/components/sections/ContactSection'

export default function HomeView() {
  return (
    <main className="w-full">
      <HeroSection />
      <AboutSection />
      <MotivationSection />
      <ExperienceSection />
      <SkillsSection />
      <MakerSection />
      <ProjectsSection />
      <BooksSection />
      <ContactSection />
    </main>
  )
}
