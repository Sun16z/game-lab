/** Return a tiny, production-host-only loader. The site token is public in HTML. */
export function beaconLoader(token) {
  if (!token) return '';
  if (!/^[a-f0-9]{32}$/i.test(token)) throw new Error('Invalid Cloudflare Web Analytics token');
  return `(function(){if(location.hostname!=="games.somewhen.life")return;function load(){if(document.querySelector('script[src^="https://static.cloudflareinsights.com/beacon.min.js"]'))return;var s=document.createElement("script");s.type="module";s.src="https://static.cloudflareinsights.com/beacon.min.js";s.setAttribute("data-cf-beacon",JSON.stringify({token:${JSON.stringify(token)}}));document.body.appendChild(s)}if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load,{once:true});else load()})();`;
}
