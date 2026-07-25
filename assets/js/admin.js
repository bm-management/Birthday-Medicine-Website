(function(){
  // Soft client-side gate only — this does NOT secure the content, it just
  // keeps casual visitors off the editing screen. Change ADMIN_PASSWORD below
  // to whatever you like; anyone who reads this file can still see it.
  var ADMIN_PASSWORD = 'saengil2026';

  var workingPosts = [];
  var editingSlug = null; // null = creating a new post
  var formLang = 'ko';
  var loadFailed = false;

  var els = {};

  function $(id){ return document.getElementById(id); }

  // translation helper for text generated in JS (list items, toasts, confirms)
  function t(ko, en){
    return (window.currentLang === 'en') ? en : ko;
  }

  function slugify(str){
    return (str || '')
      .toString().trim().toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function todayStr(){
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }

  function toast(msg){
    var el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast._h);
    toast._h = setTimeout(function(){ el.classList.remove('show'); }, 2400);
  }

  function setLangTab(lang){
    formLang = lang;
    document.querySelectorAll('.lang-tabs button').forEach(function(b){
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    document.querySelectorAll('.lang-fields').forEach(function(f){
      f.classList.toggle('active', f.dataset.lang === lang);
    });
  }

  function updateFormTitle(){
    if(editingSlug){
      var post = workingPosts.find(function(p){ return p.slug === editingSlug; });
      els.formTitle.textContent = t('글 수정 — ', 'Editing — ') + (post ? post.title : '');
    } else {
      els.formTitle.textContent = t('새 글 작성', 'Write a New Article');
    }
  }

  function resetForm(){
    editingSlug = null;
    els.form.reset();
    els.date.value = todayStr();
    els.author.value = els.author.value || '이주연';
    els.cancelEdit.style.display = 'none';
    updateFormTitle();
    setLangTab('ko');
  }

  function loadPostIntoForm(post){
    editingSlug = post.slug;
    els.slug.value = post.slug;
    els.categoryKo.value = post.category || '';
    els.categoryEn.value = post.category_en || '';
    els.titleKo.value = post.title || '';
    els.titleEn.value = post.title_en || '';
    els.excerptKo.value = post.excerpt || '';
    els.excerptEn.value = post.excerpt_en || '';
    els.contentKo.value = post.content || '';
    els.contentEn.value = post.content_en || '';
    els.date.value = post.date || todayStr();
    els.author.value = post.author || '';
    els.cancelEdit.style.display = 'inline-block';
    updateFormTitle();
    setLangTab('ko');
    window.scrollTo({ top: els.form.offsetTop - 100, behavior:'smooth' });
  }

  function renderList(){
    var wrap = els.list;
    if(workingPosts.length === 0){
      if(loadFailed && window.location.protocol === 'file:'){
        wrap.innerHTML = '<div class="admin-empty">' +
          t(
            '기존 posts.json을 불러오지 못했습니다 (지금 파일을 직접 열어서 보고 있기 때문입니다). 이 폴더의 start-server.bat을 실행하고 http://localhost:8000/admin.html 로 다시 접속해주세요. 지금 상태에서 저장하면 기존 글이 모두 사라진 채로 다운로드됩니다.',
            "Couldn't load your existing posts.json (because you're viewing this file directly). Run start-server.bat in this folder and reopen this page at http://localhost:8000/admin.html. Saving now would download a posts.json with your existing articles missing."
          ) +
          '</div>';
        return;
      }
      wrap.innerHTML = '<div class="admin-empty">' +
        t('아직 작성된 글이 없습니다. 아래에서 첫 글을 작성해보세요.', 'No articles yet. Write your first one below.') +
        '</div>';
      return;
    }
    var sorted = workingPosts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
    var editLabel = t('수정', 'Edit');
    var deleteLabel = t('삭제', 'Delete');
    wrap.innerHTML = sorted.map(function(p){
      return '' +
        '<div class="admin-list-item" data-slug="' + p.slug + '">' +
          '<div class="info">' +
            '<h4>' + p.title + '</h4>' +
            '<span>' + p.category + ' · ' + p.date + '</span>' +
          '</div>' +
          '<div class="actions">' +
            '<button type="button" class="edit-btn">' + editLabel + '</button>' +
            '<button type="button" class="danger delete-btn">' + deleteLabel + '</button>' +
          '</div>' +
        '</div>';
    }).join('');

    wrap.querySelectorAll('.edit-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var slug = btn.closest('.admin-list-item').dataset.slug;
        var post = workingPosts.find(function(p){ return p.slug === slug; });
        if(post) loadPostIntoForm(post);
      });
    });
    wrap.querySelectorAll('.delete-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var slug = btn.closest('.admin-list-item').dataset.slug;
        var post = workingPosts.find(function(p){ return p.slug === slug; });
        if(!post) return;
        var msg = t(
          '"' + post.title + '" 글을 목록에서 삭제할까요?\n(아래 "posts.json 다운로드"를 눌러 저장해야 실제 사이트에 반영됩니다.)',
          'Remove "' + post.title + '" from the list?\n(You still need to click "Download posts.json" below for this to reach the live site.)'
        );
        if(!confirm(msg)) return;
        workingPosts = workingPosts.filter(function(p){ return p.slug !== slug; });
        if(editingSlug === slug) resetForm();
        renderList();
        toast(t('삭제했습니다. posts.json을 다운로드해 반영하세요.', 'Removed. Download posts.json to publish this change.'));
      });
    });
  }

  function handleSave(e){
    e.preventDefault();

    var titleKo = els.titleKo.value.trim();
    var categoryKo = els.categoryKo.value.trim();
    var excerptKo = els.excerptKo.value.trim();
    var contentKo = els.contentKo.value.trim();

    if(!titleKo || !categoryKo || !excerptKo || !contentKo){
      toast(t('제목, 갈래, 요약, 본문(한국어)은 필수입니다.', 'Title, category, excerpt, and body (Korean) are required.'));
      setLangTab('ko');
      return;
    }

    var slug = slugify(els.slug.value) || slugify(els.titleEn.value) || slugify(titleKo) || ('post-' + Date.now());

    var duplicate = workingPosts.find(function(p){ return p.slug === slug && p.slug !== editingSlug; });
    if(duplicate){
      toast(t('이미 사용 중인 슬러그입니다. 다른 주소를 입력해주세요.', 'That slug is already in use. Please choose a different one.'));
      return;
    }

    var postData = {
      slug: slug,
      category: categoryKo,
      category_en: els.categoryEn.value.trim(),
      title: titleKo,
      title_en: els.titleEn.value.trim(),
      excerpt: excerptKo,
      excerpt_en: els.excerptEn.value.trim(),
      content: contentKo,
      content_en: els.contentEn.value.trim(),
      date: els.date.value || todayStr(),
      author: els.author.value.trim()
    };

    if(editingSlug){
      var idx = workingPosts.findIndex(function(p){ return p.slug === editingSlug; });
      if(idx > -1) workingPosts[idx] = postData;
    } else {
      workingPosts.push(postData);
    }

    renderList();
    resetForm();
    toast(t('저장했습니다. "posts.json 다운로드"로 실제 사이트에 반영하세요.', 'Saved. Click "Download posts.json" to publish this to the live site.'));
  }

  function downloadJson(){
    var data = JSON.stringify({ posts: workingPosts }, null, 2);
    var blob = new Blob([data], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'posts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast(t('posts.json 파일을 내려받았습니다. website 폴더의 posts.json을 이 파일로 교체하세요.', 'Downloaded posts.json. Replace the posts.json file in your website folder with this one.'));
  }

  function copyJson(){
    var data = JSON.stringify({ posts: workingPosts }, null, 2);
    navigator.clipboard.writeText(data).then(function(){
      toast(t('JSON을 클립보드에 복사했습니다.', 'Copied JSON to clipboard.'));
    }, function(){
      toast(t('복사에 실패했습니다. "posts.json 다운로드"를 이용해주세요.', 'Copy failed. Please use "Download posts.json" instead.'));
    });
  }

  function initGate(){
    var gate = $('admin-gate');
    var panel = $('admin-panel-wrap');
    var input = $('gate-password');
    var error = $('gate-error');
    var submit = $('gate-submit');

    function unlock(){
      gate.style.display = 'none';
      panel.style.display = '';
      sessionStorage.setItem('adminUnlocked', '1');
      initPanel();
    }

    if(sessionStorage.getItem('adminUnlocked') === '1'){
      unlock();
      return;
    }

    submit.addEventListener('click', function(){
      if(input.value === ADMIN_PASSWORD){
        unlock();
      } else {
        error.style.display = 'block';
      }
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter') submit.click();
    });
  }

  var panelInitialized = false;
  function initPanel(){
    if(panelInitialized) return;
    panelInitialized = true;

    els = {
      form: $('post-form'),
      formTitle: $('form-title'),
      slug: $('field-slug'),
      categoryKo: $('field-category-ko'),
      categoryEn: $('field-category-en'),
      titleKo: $('field-title-ko'),
      titleEn: $('field-title-en'),
      excerptKo: $('field-excerpt-ko'),
      excerptEn: $('field-excerpt-en'),
      contentKo: $('field-content-ko'),
      contentEn: $('field-content-en'),
      date: $('field-date'),
      author: $('field-author'),
      cancelEdit: $('cancel-edit'),
      list: $('admin-list')
    };

    document.querySelectorAll('.lang-tabs button').forEach(function(btn){
      btn.addEventListener('click', function(){ setLangTab(btn.dataset.lang); });
    });

    els.form.addEventListener('submit', handleSave);
    els.cancelEdit.addEventListener('click', resetForm);
    $('download-json').addEventListener('click', downloadJson);
    $('copy-json').addEventListener('click', copyJson);

    document.addEventListener('langchange', function(){
      updateFormTitle();
      renderList();
    });

    resetForm();

    fetch('posts.json', { cache:'no-store' })
      .then(function(res){ if(!res.ok) throw new Error('no posts.json'); return res.json(); })
      .then(function(data){
        workingPosts = (data && data.posts) || [];
        renderList();
      })
      .catch(function(){
        workingPosts = [];
        loadFailed = true;
        renderList();
        toast(t('posts.json을 불러오지 못했습니다.', 'Could not load posts.json.'));
      });
  }

  document.addEventListener('DOMContentLoaded', initGate);
})();
