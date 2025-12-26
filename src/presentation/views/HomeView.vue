<script setup lang="ts">
import HeroSection from '@presentation/components/sections/HeroSection.vue'
import AboutSection from '@presentation/components/sections/AboutSection.vue'
import ExperienceSection from '@presentation/components/sections/ExperienceSection.vue'
import LeadershipSection from '@presentation/components/sections/LeadershipSection.vue'
import SkillsSection from '@presentation/components/sections/SkillsSection.vue'
import MakerSection from '@presentation/components/sections/MakerSection.vue'
import ProjectsSection from '@presentation/components/sections/ProjectsSection.vue'
import BooksSection from '@presentation/components/sections/BooksSection.vue'
import ContactSection from '@presentation/components/sections/ContactSection.vue'
</script>

<template>
  <main class="home">
    <HeroSection />
    <AboutSection />
    <ExperienceSection />
    <LeadershipSection />
    <SkillsSection />
    <MakerSection />
    <ProjectsSection />
    <BooksSection />
    <ContactSection />
  </main>
</template>

<style scoped>
.home {
  width: 100%;
}
</style>

