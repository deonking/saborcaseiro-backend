// js/geolocalizacao.js
// Busca localização do usuário via IPinfo e salva nos cookies para uso no site

// Removido qualquer chamada de modal de confirmação de localização. Agora só detecta IP e salva nos cookies.
// Função utilitária para converter nome de estado para UF
function nomeEstadoParaUF(nome) {
    const mapa = {
        'Rondônia': 'RO', 'Acre': 'AC', 'Amazonas': 'AM', 'Roraima': 'RR', 'Pará': 'PA',
        'Amapá': 'AP', 'Tocantins': 'TO', 'Maranhão': 'MA', 'Piauí': 'PI', 'Ceará': 'CE',
        'Rio Grande do Norte': 'RN', 'Paraíba': 'PB', 'Pernambuco': 'PE', 'Alagoas': 'AL', 'Sergipe': 'SE',
        'Bahia': 'BA', 'Minas Gerais': 'MG', 'Espírito Santo': 'ES', 'Rio de Janeiro': 'RJ', 'São Paulo': 'SP',
        'Paraná': 'PR', 'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS', 'Mato Grosso do Sul': 'MS', 'Mato Grosso': 'MT',
        'Goiás': 'GO', 'Distrito Federal': 'DF'
    };
    if (!nome) return '';
    if (mapa[nome]) return mapa[nome];
    // Se já for UF, retorna
    if (Object.values(mapa).includes(nome)) return nome;
    return '';
}

async function buscarGeolocalizacao() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async function(position) {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log('[Geo] Coordenadas do navegador:', { lat, lon });
                const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`;
                const response = await fetch(url);
                if (!response.ok) throw new Error('Erro ao buscar localização');
                const data = await response.json();
                console.log('[Geo] Nominatim resposta:', data);
                const cidade = data.address.city || data.address.town || data.address.village || data.address.county || '';
                if (cidade) setCookie('localCidade', cidade, 2);
                if (document.getElementById('localCidade')) document.getElementById('localCidade').textContent = cidade || 'Sua região';
                if (typeof atualizarLocalizacaoDisplay === 'function') atualizarLocalizacaoDisplay();
            } catch (e) {
                console.log('[Geo] Erro ao processar resposta do navegador:', e);
                fallbackIpinfo();
            }
        }, function(error) {
            console.log('[Geo] Erro navigator.geolocation:', error);
            fallbackIpinfo();
        }, {timeout: 5000});
    } else {
        fallbackIpinfo();
    }
}

async function fallbackIpinfo() {
    try {
        const response = await fetch('https://ipinfo.io/json?token=demo');
        if (!response.ok) throw new Error('Erro ao buscar localização');
        const data = await response.json();
        console.log('[Geo] IPinfo resposta:', data);
        if (data.city) setCookie('localCidade', data.city, 2);
        if (document.getElementById('localCidade')) document.getElementById('localCidade').textContent = data.city || 'Sua região';
        if (typeof atualizarLocalizacaoDisplay === 'function') atualizarLocalizacaoDisplay();
    } catch (e) {
        console.log('[Geo] Erro ao processar resposta do IPinfo:', e);
        if (document.getElementById('localCidade')) document.getElementById('localCidade').textContent = 'Sua região';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Executa geolocalização imediatamente
    buscarGeolocalizacao().then(() => {
        // Após buscar e salvar cookies, atualiza exibição
        if (typeof atualizarLocalizacaoDisplay === 'function') {
            atualizarLocalizacaoDisplay();
        }
    });
    // Mostra 'Detectando...' enquanto busca
    if (document.getElementById('localCidade')) document.getElementById('localCidade').textContent = 'Detectando...';
});
