const track = document.querySelector('.carousel-track');
const prevButton = document.querySelector('.carousel-control.prev');
const nextButton = document.querySelector('.carousel-control.next');

let currentSlide = 0;

nextButton.addEventListener('click', () => {
  const items = document.querySelectorAll('.carousel-item');
  const totalSlides = Math.ceil(items.length / 2) - 1; // Total de grupos de 2 imágenes
  if (currentSlide < totalSlides) {
    currentSlide++;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
});

prevButton.addEventListener('click', () => {
  if (currentSlide > 0) {
    currentSlide--;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
});
