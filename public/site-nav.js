const menus = document.querySelectorAll('.site-menu');

for (const menu of menus) {
  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) menu.open = false;
  });
}

document.addEventListener('click', (event) => {
  for (const menu of menus) {
    if (!menu.contains(event.target)) menu.open = false;
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 1050) {
    for (const menu of menus) menu.open = false;
  }
});
