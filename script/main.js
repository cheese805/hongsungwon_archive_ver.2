// index.html 전용 : 프레젠테이션처럼 한 섹션씩 부드럽게 넘기기
document.addEventListener('DOMContentLoaded', () => {
  const wrapper  = document.getElementById('fullpage-wrapper');
  const sections = [...document.querySelectorAll('.section')];
  const triggers = document.querySelectorAll('[data-next-section]');

  if (!wrapper || sections.length === 0) return;

  // ===== 상태/튜닝 =====
  let currentIndex = 0;
  let isAnimating  = false;
  let touchStartY  = 0;

  const WHEEL_THRESHOLD = 40;   // 마우스 휠 감도 (높을수록 둔감)
  const SWIPE_THRESHOLD = 50;   // 터치 스와이프 감도 (px)
  const ANIMATION_MS    = 600;  // 한 섹션 넘어가는 시간 (대충 0.6초)

  const clampIndex = (i) => Math.max(0, Math.min(sections.length - 1, i));

  const goToSection = (index) => {
    const targetIndex = clampIndex(index);
    const targetTop   = sections[targetIndex].offsetTop;

    isAnimating = true;

    wrapper.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });

    // 애니메이션이 끝났다고 가정하는 시간
    setTimeout(() => {
      currentIndex = targetIndex;
      isAnimating  = false;
    }, ANIMATION_MS);
  };

  // ===== 마우스 휠 : 딱 한 섹션씩 =====
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();          // 브라우저 기본 스크롤 막기 (탄성 차단)

    if (isAnimating) return;

    if (e.deltaY > WHEEL_THRESHOLD && currentIndex < sections.length - 1) {
      goToSection(currentIndex + 1);
    } else if (e.deltaY < -WHEEL_THRESHOLD && currentIndex > 0) {
      goToSection(currentIndex - 1);
    }
  }, { passive: false });

  // ===== 터치 스와이프(모바일) =====
  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  // 이동 중에는 브라우저가 직접 스크롤 못하게 막음 (탄성 방지)
  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
  }, { passive: false });

  wrapper.addEventListener('touchend', (e) => {
    if (isAnimating) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY; // 양수: 위로 쓸어올림(다음 섹션)

    // 살짝 건드린 정도면, 그냥 현재 섹션으로 다시 정렬
    if (Math.abs(diff) < SWIPE_THRESHOLD) {
      goToSection(currentIndex);
      return;
    }

    if (diff > 0 && currentIndex < sections.length - 1) {
      // 위로 스와이프 → 아래(다음) 섹션
      goToSection(currentIndex + 1);
    } else if (diff < 0 && currentIndex > 0) {
      // 아래로 스와이프 → 위(이전) 섹션
      goToSection(currentIndex - 1);
    }
  }, { passive: true });

  // ===== [data-next-section] 버튼으로 이동 =====
  triggers.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isAnimating) return;

      const target = btn.dataset.nextSection;

      if (!target || target === 'next') {
        goToSection(currentIndex + 1);
      } else {
        const idx = sections.findIndex(sec => sec.id === target);
        if (idx !== -1) {
          goToSection(idx);
        }
      }
    });
  });

  // ===== 키보드로도 슬라이드 넘기기 (선택) =====
  window.addEventListener('keydown', (e) => {
    if (isAnimating) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      goToSection(currentIndex + 1);
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goToSection(currentIndex - 1);
    }
  });

  // 처음 로딩하면 0번 섹션으로
  goToSection(0);
});
