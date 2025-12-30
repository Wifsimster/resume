<script setup lang="ts">
</script>

<template>
  <TresGroup :position="[-0.5, 0.05, 0.85]">
    <!-- Main body -->
    <TresMesh>
      <TresBoxGeometry :args="[0.28, 0.1, 0.45]" />
      <TresMeshStandardMaterial :color="'#4A4A4A'" :roughness="0.4" :metalness="0.1" />
    </TresMesh>

    <!-- Top curved part -->
    <TresMesh :position="[0, 0.04, 0.03]">
      <TresBoxGeometry :args="[0.26, 0.04, 0.38]" />
      <TresMeshStandardMaterial :color="'#4D4D4D'" :roughness="0.35" :metalness="0.1" />
    </TresMesh>

    <!-- Left click -->
    <TresMesh :position="[-0.055, 0.075, -0.1]">
      <TresBoxGeometry :args="[0.1, 0.015, 0.2]" />
      <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
    </TresMesh>

    <!-- Right click -->
    <TresMesh :position="[0.055, 0.075, -0.1]">
      <TresBoxGeometry :args="[0.1, 0.015, 0.2]" />
      <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
    </TresMesh>

    <!-- Scroll wheel -->
    <TresMesh :position="[0, 0.08, -0.08]" :rotation="[Math.PI / 2, 0, 0]">
      <TresCylinderGeometry :args="[0.025, 0.025, 0.03, 16]" />
      <TresMeshStandardMaterial :color="'#606060'" :roughness="0.3" :metalness="0.5" />
    </TresMesh>
  </TresGroup>

  <!-- Mousepad -->
  <TresGroup :position="[-2, 0.06, 1]">
    <TresMesh>
      <TresBoxGeometry :args="[4.2, 0.025, 1.2]" />
      <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0" />
    </TresMesh>
  </TresGroup>
</template>

