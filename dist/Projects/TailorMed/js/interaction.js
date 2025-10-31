// Timeline 和 Card 互動效果
document.addEventListener('DOMContentLoaded', function () {
  // Mobile Vertical Timeline - 調整乾冰圖示位置
  function adjustDryiceIconForMobile() {
    const eventIcon = document.querySelector('.timeline-event-icon');
    const timelineNodes = document.querySelectorAll('.timeline-node');

    if (eventIcon && timelineNodes.length >= 8 && window.innerWidth <= 768) {
      // Mobile: 計算步驟 7 和 8 之間的位置
      const node7 = timelineNodes[6]; // 第 7 個節點 (index 6)
      const node8 = timelineNodes[7]; // 第 8 個節點 (index 7)

      if (node7 && node8) {
        const node7Rect = node7.getBoundingClientRect();
        const node8Rect = node8.getBoundingClientRect();
        const containerRect = node7.parentElement.getBoundingClientRect();

        const middlePosition =
          (node7Rect.bottom -
            containerRect.top +
            (node8Rect.top - containerRect.top)) /
          2;

        eventIcon.style.top = middlePosition + 'px';
        eventIcon.style.left = '20px';
      }
    } else if (eventIcon && window.innerWidth > 768) {
      // Desktop: 重置為原始位置
      eventIcon.style.top = '';
      eventIcon.style.left = '';
    }
  }

  // 初始調整
  adjustDryiceIconForMobile();

  // 視窗大小改變時重新調整
  window.addEventListener('resize', adjustDryiceIconForMobile);

  // 只對 V1 版本生效，V2 版本不啟用節點與卡片的連動
  const timelineNodes = document.querySelectorAll(
    '.status-panel:not(.status-panel-v2) .timeline-node.completed, .status-panel:not(.status-panel-v2) .timeline-node.active, .status-panel:not(.status-panel-v2) .timeline-node.pending'
  );
  const timelineCards = document.querySelectorAll(
    '.status-panel:not(.status-panel-v2) .timeline-card.completed, .status-panel:not(.status-panel-v2) .timeline-card.active, .status-panel:not(.status-panel-v2) .timeline-card.pending'
  );
  const eventCard = document.querySelector(
    '.status-panel:not(.status-panel-v2) .timeline-card.event'
  );
  const eventIcon = document.querySelector(
    '.status-panel:not(.status-panel-v2) .timeline-event-icon'
  );

  // 當滑鼠移到 Timeline 節點時，高亮對應的卡片（只對 V1 版本）
  timelineNodes.forEach((node, index) => {
    node.addEventListener('mouseenter', function () {
      // 只對應一般卡片，不包含乾冰卡片
      if (timelineCards[index]) {
        timelineCards[index].classList.add('highlight');
      }
    });

    node.addEventListener('mouseleave', function () {
      if (timelineCards[index]) {
        timelineCards[index].classList.remove('highlight');
      }
    });
  });

  // 當滑鼠移到一般卡片時，放大對應的 Timeline 節點（只對 V1 版本）
  timelineCards.forEach((card, index) => {
    card.addEventListener('mouseenter', function () {
      if (timelineNodes[index]) {
        timelineNodes[index].classList.add('scale-up');
      }
    });

    card.addEventListener('mouseleave', function () {
      if (timelineNodes[index]) {
        timelineNodes[index].classList.remove('scale-up');
      }
    });
  });

  // 當滑鼠移到 Timeline 上的乾冰圖示時，高亮乾冰卡片並切換圖片
  if (eventIcon && eventCard) {
    const eventCardImgDefault = eventCard.querySelector(
      '.card-icon-img.icon-default'
    );
    const eventCardImgHover = eventCard.querySelector(
      '.card-icon-img.icon-hover'
    );
    const eventIconImg = eventIcon.querySelector('img');

    // 只在 Desktop 版本（寬度 > 768px）才啟用互動
    if (window.innerWidth > 768) {
      eventIcon.addEventListener('mouseenter', function () {
        eventCard.classList.add('highlight');
        eventIcon.classList.add('scale-up');
        // 切換為 hover 圖示
        if (eventCardImgDefault && eventCardImgHover) {
          eventCardImgDefault.style.display = 'none';
          eventCardImgHover.style.display = 'block';
        }
        if (eventIconImg) {
          eventIconImg.src = 'images/icon-dryice_hover.svg';
        }
      });

      eventIcon.addEventListener('mouseleave', function () {
        eventCard.classList.remove('highlight');
        eventIcon.classList.remove('scale-up');
        // 切換回原始圖示
        if (eventCardImgDefault && eventCardImgHover) {
          eventCardImgDefault.style.display = 'block';
          eventCardImgHover.style.display = 'none';
        }
        if (eventIconImg) {
          eventIconImg.src = 'images/icon-dryice.svg';
        }
      });

      // 當滑鼠移到乾冰卡片時，也要切換圖示
      eventCard.addEventListener('mouseenter', function () {
        eventIcon.classList.add('scale-up');
        // 切換為 hover 圖示
        if (eventCardImgDefault && eventCardImgHover) {
          eventCardImgDefault.style.display = 'none';
          eventCardImgHover.style.display = 'block';
        }
        if (eventIconImg) {
          eventIconImg.src = 'images/icon-dryice_hover.svg';
        }
      });

      eventCard.addEventListener('mouseleave', function () {
        eventIcon.classList.remove('scale-up');
        // 切換回原始圖示
        if (eventCardImgDefault && eventCardImgHover) {
          eventCardImgDefault.style.display = 'block';
          eventCardImgHover.style.display = 'none';
        }
        if (eventIconImg) {
          eventIconImg.src = 'images/icon-dryice.svg';
        }
      });
    }
  }

  // ==========================================
  // 進度條滾動動畫 - Intersection Observer
  // ==========================================

  // 只在 Desktop 版本（寬度 > 768px）才啟用滾動觸發動畫
  if (window.innerWidth > 768) {
    const timelineProgress = document.querySelector('.timeline-progress');
    const statusPanel = document.querySelector('.status-panel');

    if (timelineProgress && statusPanel) {
      // 從 data 屬性獲取目標寬度，或從 style 屬性解析
      const targetWidth =
        timelineProgress.dataset.targetWidth ||
        timelineProgress.style.width ||
        '87.5%';

      // 初始化：將進度條設為 0 寬度
      timelineProgress.style.width = '0';

      console.log('Timeline Progress 初始化完成，目標寬度:', targetWidth);

      // 創建 Intersection Observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              console.log('Timeline 進入可視範圍，準備觸發動畫...');

              // 當 timeline 進入可視範圍時，觸發動畫
              setTimeout(() => {
                timelineProgress.classList.add('animate');
                timelineProgress.style.width = targetWidth;
                console.log('動畫已觸發，寬度設為:', targetWidth);
              }, 200); // 延遲 200ms 讓效果更明顯

              // 觸發後就不再觀察（動畫只播放一次）
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.3, // 當 30% 的元素進入可視範圍時觸發
          rootMargin: '0px 0px -100px 0px', // 往上偏移 100px，讓動畫更早觸發
        }
      );

      // 開始觀察 status-panel
      observer.observe(statusPanel);
      console.log('開始觀察 status-panel，等待滾動觸發...');
    }
  }
});
