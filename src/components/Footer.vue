<script setup lang="ts">
// Footer component with credits
</script>

<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="credit">
        Made by 
        <a 
          href="https://abdalazizportfolio.netlify.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          class="creator-link"
        >
          Abdalaziz Sairfi
        </a>
      </p>
      <p class="tagline">A one-time emotional experience</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  padding: 15px 20px;
  background: var(--black);
  border-top: 2px solid var(--white);
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.credit {
  margin: 0;
  font-size: 0.85em;
  color: var(--white);
  letter-spacing: 1px;
}

.creator-link {
  color: var(--white);
  text-decoration: none;
  font-weight: bold;
  padding: 2px 5px;
  border-bottom: 2px solid var(--white);
  transition: all 0.2s;
}

.creator-link:hover {
  background: var(--white);
  color: var(--black);
  transform: translateY(-2px);
}

.tagline {
  margin: 0;
  font-size: 0.7em;
  color: var(--white);
  opacity: 0.6;
  letter-spacing: 1px;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .app-footer {
    padding: 12px 15px;
  }

  .credit {
    font-size: 0.75em;
  }

  .tagline {
    font-size: 0.65em;
  }
}
</style>

