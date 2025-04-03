(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18M12 3l9 9-9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function checkServerAvailability(url, callback) {
        fetch(url, { method: 'HEAD', mode: 'no-cors' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    function startMe() {
        $('#REDIRECT').remove();
        var domainSVG = icon_server_redirect;
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        if (!Lampa.Storage.get('location_servers')) {
            setTimeout(() => { $('#REDIRECT').remove(); }, 10);
        }
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            var servers = Lampa.Storage.get('location_servers') || [];
            if (servers.length === 1) {
                window.location.href = server_protocol + servers[0].url;
            } else {
                Lampa.Select.show({
                    title: 'Выберите сервер',
                    items: servers.map(s => ({ title: s.name + (s.available ? ' ✅' : ' ❌'), url: s.url })),
                    onSelect: function (selected) {
                        window.location.href = server_protocol + selected.url;
                    }
                });
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: icon_server_redirect
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'location_servers',
            type: 'button',
            values: '',
            placeholder: 'Добавить сервер',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Добавьте и управляйте серверами'
        },
        onClick: function () {
            Lampa.Input.show({
                title: 'Добавить сервер',
                placeholder: 'Название сервера',
                onBack: () => Lampa.Settings.back(),
                onEnter: function (name) {
                    Lampa.Input.show({
                        title: 'Введите адрес сервера',
                        placeholder: 'Например: lampa.surge.sh',
                        onBack: () => Lampa.Settings.back(),
                        onEnter: function (url) {
                            var servers = Lampa.Storage.get('location_servers') || [];
                            var newServer = { name: name, url: url, available: false };
                            checkServerAvailability(server_protocol + url, function (isAvailable) {
                                newServer.available = isAvailable;
                                servers.push(newServer);
                                Lampa.Storage.set('location_servers', servers);
                            });
                        }
                    });
                }
            });
        }
    });
    
    if (Lampa.Storage.field('const_redirect')) {
        var servers = Lampa.Storage.get('location_servers') || [];
        if (servers.length > 0) {
            window.location.href = server_protocol + servers[0].url;
        }
    }
    
    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startMe();
        });
    }
})();
