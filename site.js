
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const money = n => `L ${Number(n).toFixed(2)}`;
const products = window.PRODUCTS || [];

const menuToggle = $('[data-menu-toggle]');
const menu = $('[data-menu]');
if (menuToggle && menu) menuToggle.addEventListener('click',()=>{menu.classList.toggle('open');document.body.classList.toggle('no-scroll',menu.classList.contains('open'));});

const slides = $$('.slide'); let slideIndex=0;
function showSlide(i){ if(!slides.length)return; slides.forEach((s,n)=>s.classList.toggle('active',n===i)); }
function nextSlide(dir=1){ if(!slides.length)return; slideIndex=(slideIndex+dir+slides.length)%slides.length; showSlide(slideIndex); }
$('[data-next]')?.addEventListener('click',()=>nextSlide(1));
$('[data-prev]')?.addEventListener('click',()=>nextSlide(-1));
if(slides.length){showSlide(0); setInterval(()=>nextSlide(1),5200);}

function getCart(){ try{return JSON.parse(localStorage.getItem('colinenaCart')||'{}')}catch{return {}} }
function saveCart(cart){ localStorage.setItem('colinenaCart',JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){ const c=getCart(); const total=Object.values(c).reduce((a,b)=>a+Number(b||0),0); $$('[data-cart-count]').forEach(el=>el.textContent=total); }
function addToCart(id,qty=1){ const c=getCart(); c[id]=(Number(c[id])||0)+Number(qty); saveCart(c); return c[id]; }
function removeFromCart(id){ const c=getCart(); delete c[id]; saveCart(c); renderCart(); }
function setCartQty(id,qty){ const c=getCart(); if(qty<=0) delete c[id]; else c[id]=qty; saveCart(c); renderCart(); }

function productCard(p){ const final=p.offer&&p.offerPrice?p.offerPrice:p.price; return `<article class="product-card"><div class="product-meta"><span>${p.category}</span>${p.offer?'<span class="badge offer">Oferta</span>':''}</div><div class="product-image"><img src="${p.image}" alt="${p.name}"></div><h3>${p.name}</h3><p>${p.description}</p><div class="price-row"><div class="price">${money(final)} ${p.offer?`<small>${money(p.price)}</small>`:''}</div><span class="badge">Stock ${p.stock}</span></div><div class="price-row"><div class="qty-add"><input type="number" value="1" min="1" max="${p.stock}" aria-label="Cantidad"><button class="btn small" type="button" data-add="${p.id}">Apartar</button></div></div></article>`; }
function wireAddButtons(root=document){ $$('[data-add]',root).forEach(btn=>btn.addEventListener('click',()=>{ const input=btn.parentElement.querySelector('input'); const qty=Math.max(1,Number(input?.value||1)); addToCart(btn.dataset.add,qty); const old=btn.textContent; btn.textContent='Agregado ✓'; setTimeout(()=>btn.textContent=old,1000); })); }
function renderCards(list, target){ const el=$(target); if(!el)return; el.innerHTML=list.map(productCard).join(''); wireAddButtons(el); }

renderCards(products.filter(p=>p.featured),'#featured-grid');
renderCards(products.filter(p=>p.offer),'#offers-grid');

const productsGrid=$('#products-grid');
if(productsGrid){
  let activeCategory=new URLSearchParams(location.search).get('categoria')||'';
  let term='';
  function renderProducts(){ const filtered=products.filter(p=>(!activeCategory||p.slug===activeCategory)&&(!term||`${p.name} ${p.brand} ${p.description}`.toLowerCase().includes(term))); renderCards(filtered,'#products-grid'); $('#products-empty').hidden=filtered.length>0; $$('#category-filters [data-category]').forEach(b=>b.classList.toggle('active',b.dataset.category===activeCategory)); }
  $('#search-form')?.addEventListener('submit',e=>{e.preventDefault();term=$('#product-search').value.trim().toLowerCase();renderProducts();});
  $$('#category-filters [data-category]').forEach(b=>b.addEventListener('click',()=>{activeCategory=b.dataset.category;history.replaceState({},'',activeCategory?`?categoria=${activeCategory}`:location.pathname);renderProducts();}));
  renderProducts();
}

function renderCart(){ const body=$('#cart-body'); if(!body)return; const c=getCart(); const entries=Object.entries(c).map(([id,qty])=>({p:products.find(x=>String(x.id)===String(id)),qty:Number(qty)})).filter(x=>x.p&&x.qty>0); $('#cart-empty').hidden=entries.length>0; $('#cart-content').hidden=entries.length===0; let total=0; body.innerHTML=entries.map(({p,qty})=>{ const price=p.offer&&p.offerPrice?p.offerPrice:p.price; const sub=price*qty; total+=sub; return `<tr><td><div class="cart-product"><img src="${p.image}" alt="${p.name}"><div><strong>${p.name}</strong><br><span>${money(price)}</span></div></div></td><td><input class="input" style="width:90px" type="number" min="0" max="${p.stock}" value="${qty}" data-cart-qty="${p.id}"></td><td><strong>${money(sub)}</strong></td><td><button class="btn danger small" type="button" data-remove="${p.id}">Quitar</button></td></tr>`;}).join(''); $('#cart-total').textContent=money(total); $$('[data-remove]').forEach(b=>b.addEventListener('click',()=>removeFromCart(b.dataset.remove))); $$('[data-cart-qty]').forEach(i=>i.addEventListener('change',()=>setCartQty(i.dataset.cartQty,Math.max(0,Number(i.value||0))))); }
renderCart();
$('#checkout-form')?.addEventListener('submit',e=>{e.preventDefault(); if(!Object.keys(getCart()).length){ const n=$('#cart-notice'); n.hidden=false;n.classList.add('error');n.textContent='Agrega al menos un producto antes de enviar el apartado.';return;} const code='COL-'+Math.floor(1000+Math.random()*9000); const n=$('#cart-notice');n.hidden=false;n.classList.remove('error');n.innerHTML=`Apartado de demostración registrado con el código <strong>${code}</strong>.`; localStorage.removeItem('colinenaCart'); updateCartCount(); renderCart(); e.target.reset(); window.scrollTo({top:0,behavior:'smooth'});});
$('#contact-form')?.addEventListener('submit',e=>{e.preventDefault(); const n=$('#contact-notice');n.hidden=false;n.textContent='Mensaje enviado en modo demostración. En la versión PHP se guarda en MySQL.';e.target.reset();});
$('#admin-demo-form')?.addEventListener('submit',e=>{e.preventDefault(); const n=$('#admin-notice');n.hidden=false;n.textContent='El panel real necesita PHP/MySQL. Esta es la vista pública para GitHub Pages.';});

const revealItems=$$('.product-card,.panel,.stat');
if('IntersectionObserver' in window){ const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'ease-out',fill:'forwards'});observer.unobserve(entry.target);}}),{threshold:.12});revealItems.forEach(i=>observer.observe(i)); }
updateCartCount();
