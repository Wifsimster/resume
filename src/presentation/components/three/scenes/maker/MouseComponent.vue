<script setup lang="ts">
</script>

<template>
  <TresGroup :position="[-1.0, 0.05, 0.75]">
    <!-- Main body -->
    <TresMesh>
      <TresBoxGeometry :args="[0.143, 0.091, 0.245]" />
      <TresMeshStandardMaterial :color="'#4A4A4A'" :roughness="0.4" :metalness="0.1" />
    </TresMesh>

    <!-- Top curved part -->
    <TresMesh :position="[0, 0.036, 0.016]">
      <TresBoxGeometry :args="[0.133, 0.036, 0.207]" />
      <TresMeshStandardMaterial :color="'#4D4D4D'" :roughness="0.35" :metalness="0.1" />
    </TresMesh>

    <!-- Left click -->
    <TresMesh :position="[-0.028, 0.068, -0.054]">
      <TresBoxGeometry :args="[0.051, 0.014, 0.109]" />
      <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
    </TresMesh>

    <!-- Right click -->
    <TresMesh :position="[0.028, 0.068, -0.054]">
      <TresBoxGeometry :args="[0.051, 0.014, 0.109]" />
      <TresMeshStandardMaterial :color="'#3D3D3D'" :roughness="0.3" />
    </TresMesh>

    <!-- Scroll wheel -->
    <TresMesh :position="[0, 0.073, -0.044]" :rotation="[Math.PI / 2, 0, 0]">
      <TresCylinderGeometry :args="[0.013, 0.013, 0.016, 16]" />
      <TresMeshStandardMaterial :color="'#606060'" :roughness="0.3" :metalness="0.5" />
    </TresMesh>
  </TresGroup>

  <!-- Mousepad - 1200mm x 600mm, centered on desk -->
  <TresGroup :position="[-2, 0.06, 0.65]">
    <TresMesh>
      <TresBoxGeometry :args="[3.0, 0.025, 1.5]" />
      <TresMeshStandardMaterial :color="'#0A0A0A'" :roughness="0.9" :metalness="0" />
    </TresMesh>
  </TresGroup>
</template>
