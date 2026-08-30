// BlastTier - icon-based kit tabs.
// No players are pre-added. Keep the assets folder beside index.html.
document.querySelectorAll('.kit').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.kit').forEach(x=>x.classList.remove('active'));
    tab.classList.add('active');
  });
});
