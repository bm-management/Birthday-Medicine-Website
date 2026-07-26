(function(){
  var currentPost = null;
  var loadFailed = false;

  function fieldFor(post, base){
    var lang = window.currentLang || 'ko';
    if(lang === 'en' && post[base + '_en']) return post[base + '_en'];
    return post[base];
  }

  function formatDate(dateStr, lang){
    var d = new Date(dateStr + 'T00:00:00');
    if(isNaN(d)) return dateStr;
    if(lang === 'en'){
      return d.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    }
    return d.getFullYear() + '년 ' + (d.getMonth()+1) + '월 ' + d.getDate() + '일';
  }

  function paragraphsToHtml(text){
    return text.split(/\n\s*\n/).map(function(para){
      return '<p>' + para.trim().replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  function render(){
    var lang = window.currentLang || 'ko';
    var root = document.getElementById('post-root');
    if(!root) return;

    if(!currentPost){
      if(loadFailed && window.location.protocol === 'file:'){
        root.innerHTML = '<div class="empty-state">' +
          '<h3>' + (lang==='en' ? "Can't load posts.json this way" : 'posts.json을 이렇게는 불러올 수 없습니다') + '</h3>' +
          '<p>' + (lang==='en'
            ? "You're viewing this file directly (file://), and browsers block pages from reading local JSON files that way. Run start-server.bat in the website folder and open http://localhost:8000 instead."
            : '지금 파일을 직접 열어서(file://) 보고 있어서, 브라우저가 로컬 posts.json 파일을 읽지 못하게 막고 있습니다. website 폴더의 start-server.bat을 실행한 뒤 http://localhost:8000 으로 접속해보세요.') +
          '</p>' +
          '</div>';
        document.title = (lang==='en' ? "Can't load article" : '글을 불러올 수 없습니다') + ' · 생일약 저널';
        return;
      }
      root.innerHTML = '<div class="empty-state">' +
        '<h3>' + (lang==='en' ? 'Article not found' : '글을 찾을 수 없습니다') + '</h3>' +
        '<p>' + (lang==='en' ? 'It may have been unpublished or the link is incorrect.' : '삭제되었거나 잘못된 링크일 수 있습니다.') + '</p>' +
        '</div>';
      document.title = (lang==='en' ? 'Article not found' : '글을 찾을 수 없습니다') + ' · 생일약 저널';
      return;
    }

    var authorLabel = lang === 'en' ? 'By ' : '글 · ';
    document.title = fieldFor(currentPost, 'title') + ' · 생일약 저널';

    root.innerHTML =
      '<div class="post-head">' +
        '<span class="tag">' + fieldFor(currentPost,'category') + '</span>' +
        '<h1>' + fieldFor(currentPost,'title') + '</h1>' +
        '<div class="post-meta">' +
          '<span>' + formatDate(currentPost.date, lang) + '</span>' +
          '<span>' + authorLabel + (currentPost.author || '') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="post-body">' + paragraphsToHtml(fieldFor(currentPost,'content') || '') + '</div>';
  }

  function boot(){
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');

    fetch('posts.json', { cache:'no-store' })
      .then(function(res){ if(!res.ok) throw new Error('no posts.json'); return res.json(); })
      .then(function(data){
        var posts = (data && data.posts) || [];
        currentPost = posts.find(function(p){ return p.slug === slug; }) || null;
        render();
      })
      .catch(function(){
        currentPost = null;
        loadFailed = true;
        render();
      });
  }

  document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('langchange', render);
})();
