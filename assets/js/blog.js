(function(){
  var allPosts = [];
  var activeCategory = 'all';
  var loadFailed = false;
  var showAll = false;
  var PAGE_SIZE = 6;

  function fieldFor(post, base){
    var lang = window.currentLang || 'ko';
    if(lang === 'en' && post[base + '_en']) return post[base + '_en'];
    return post[base];
  }

  function formatDate(dateStr, lang){
    var d = new Date(dateStr + 'T00:00:00');
    if(isNaN(d)) return dateStr;
    if(lang === 'en'){
      return d.toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });
    }
    return d.getFullYear() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + String(d.getDate()).padStart(2,'0');
  }

  function renderFilters(){
    var bar = document.getElementById('blog-filters');
    if(!bar) return;
    var lang = window.currentLang || 'ko';
    var cats = [];
    allPosts.forEach(function(p){
      var key = p.category;
      if(cats.indexOf(key) === -1) cats.push(key);
    });

    var html = '';
    html += '<button type="button" data-cat="all" class="' + (activeCategory==='all'?'active':'') + '">' +
      (lang === 'en' ? 'All' : '전체') + '</button>';
    cats.forEach(function(cat){
      var post = allPosts.find(function(p){ return p.category === cat; });
      var label = fieldFor(post, 'category');
      html += '<button type="button" data-cat="' + cat + '" class="' + (activeCategory===cat?'active':'') + '">' + label + '</button>';
    });
    bar.innerHTML = html;

    bar.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click', function(){
        activeCategory = btn.dataset.cat;
        showAll = false;
        renderFilters();
        renderList();
      });
    });
  }

  function renderList(){
    var grid = document.getElementById('blog-grid');
    var moreWrap = document.getElementById('blog-more');
    if(!grid) return;
    var lang = window.currentLang || 'ko';

    var posts = allPosts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    if(activeCategory !== 'all'){
      posts = posts.filter(function(p){ return p.category === activeCategory; });
    }

    if(posts.length === 0){
      grid.classList.add('is-empty');
      if(moreWrap) moreWrap.innerHTML = '';

      if(loadFailed && window.location.protocol === 'file:'){
        grid.innerHTML = '<div class="empty-state">' +
          '<h3>' + (lang==='en' ? "Can't load posts.json this way" : 'posts.json을 이렇게는 불러올 수 없습니다') + '</h3>' +
          '<p>' + (lang==='en'
            ? "You're viewing this file directly (file://), and browsers block pages from reading local JSON files that way. Run start-server.bat in this folder (or any local server) and open http://localhost:8000 instead. Once this site is uploaded to real hosting, it will work normally without a local server."
            : '지금 파일을 직접 열어서(file://) 보고 있어서, 브라우저가 로컬 posts.json 파일을 읽지 못하게 막고 있습니다. 이 폴더의 start-server.bat을 실행한 뒤 http://localhost:8000 으로 접속해보세요. 실제 호스팅에 업로드하면 로컬 서버 없이도 정상적으로 보입니다.') +
          '</p>' +
          '</div>';
        return;
      }

      grid.innerHTML = '<div class="empty-state">' +
        '<h3>' + (lang==='en' ? 'No articles yet' : '아직 등록된 글이 없습니다') + '</h3>' +
        '<p>' + (lang==='en' ? 'New articles will appear here once the admin publishes them.' : '관리자가 글을 발행하면 이곳에 표시됩니다.') + '</p>' +
        '</div>';
      return;
    }

    var visiblePosts = showAll ? posts : posts.slice(0, PAGE_SIZE);

    grid.classList.remove('is-empty');
    grid.innerHTML = visiblePosts.map(function(p){
      var readMore = lang === 'en' ? 'Read more' : '더 읽기';
      return '' +
        '<a class="jar" href="post.html?slug=' + encodeURIComponent(p.slug) + '">' +
          '<span class="mark" aria-hidden="true"></span>' +
          '<span class="tag">' + fieldFor(p,'category') + '</span>' +
          '<h3>' + fieldFor(p,'title') + '</h3>' +
          '<p>' + fieldFor(p,'excerpt') + '</p>' +
          '<span class="jar-meta">' +
            '<span>' + formatDate(p.date, lang) + '</span>' +
            '<span class="read-more">' + readMore + '</span>' +
          '</span>' +
        '</a>';
    }).join('');

    if(!moreWrap) return;

    var remaining = posts.length - visiblePosts.length;
    if(!showAll && remaining > 0){
      var label = lang === 'en' ? ('See more (' + remaining + ')') : ('더 보기 (' + remaining + ')');
      moreWrap.innerHTML = '<button type="button" class="btn ghost" id="blog-more-btn">' + label + '</button>';
      document.getElementById('blog-more-btn').addEventListener('click', function(){
        showAll = true;
        renderList();
      });
    } else {
      moreWrap.innerHTML = '';
    }
  }

  function boot(){
    fetch('posts.json', { cache:'no-store' })
      .then(function(res){ if(!res.ok) throw new Error('no posts.json'); return res.json(); })
      .then(function(data){
        allPosts = (data && data.posts) || [];
        renderFilters();
        renderList();
      })
      .catch(function(){
        allPosts = [];
        loadFailed = true;
        renderFilters();
        renderList();
      });
  }

  document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('langchange', function(){
    renderFilters();
    renderList();
  });
})();
