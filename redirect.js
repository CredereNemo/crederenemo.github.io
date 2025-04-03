(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75Z" fill="currentColor"/><path d="M3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284Z" fill="currentColor"/></svg>';

    function checkServerStatus(url, callback) {
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

        let servers = Lampa.Storage.get('location_servers') || [];
        
        if (servers.length === 1) {
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
                window.location.href = server_protocol + servers[0].url;
            });
        } else if (servers.length > 1) {
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
                let options = servers.map(s => ({ title: s.name, onSelect: () => window.location.href = server_protocol + s.url }));
                Lampa.Select.show({ title: 'Выберите сервер', items: options });
            });
        }
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
            description: 'Управление списком серверов'
        },
        onClick: function () {
            let servers = Lampa.Storage.get('location_servers') || [];
            
            Lampa.Input.show({
                title: 'Добавить сервер',
                placeholder: 'Адрес сервера',
                onEnter: function (url) {
                    Lampa.Input.show({
                        title: 'Название сервера',
                        placeholder: 'Введите название',
                        onEnter: function (name) {
                            let newServer = { name, url };
                            servers.push(newServer);
                            Lampa.Storage.set('location_servers', servers);
                            startMe();
                        }
                    });
                }
            });
        }
    });

    if (Lampa.Storage.field('const_redirect') == true) {
        let servers = Lampa.Storage.get('location_servers') || [];
        if (servers.length > 0) {
            window.location.href = server_protocol + servers[0].url;
        }
    }

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                startMe();
            }
        });
    }
})();
