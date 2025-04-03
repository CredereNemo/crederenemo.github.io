(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5L16 12L9 19" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    
    function startMe() {
        $('#REDIRECT').remove();
        var domainButton = `<div id="REDIRECT" class="head__action selector redirect-screen">${icon_server_redirect}</div>`;
        
        $('.head__actions').append(domainButton);
        $('#REDIRECT').insertAfter('.open--settings');

        if (!Lampa.Storage.get('location_servers')) {
            setTimeout(() => $('#REDIRECT').remove(), 10);
        }

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            let servers = Lampa.Storage.get('location_servers') || [];
            if (servers.length > 0) {
                window.location.href = server_protocol + servers[0];
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
            type: 'textarea',
            values: '',
            placeholder: 'Например: lampa.surge.sh\nexample.com',
            default: ''
        },
        field: {
            name: 'Адреса серверов',
            description: 'Введите несколько серверов, разделяя их новой строкой.'
        },
        onChange: function (value) {
            let servers = value.split('\n').map(s => s.trim()).filter(Boolean);
            Lampa.Storage.set('location_servers', servers);
            if (servers.length === 0) {
                $('#REDIRECT').remove();
            } else {
                startMe();
            }
        }
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'const_redirect',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Постоянный редирект',
            description: 'Если включено, переключиться обратно можно только через сброс настроек.'
        }
    });
    
    if (Lampa.Storage.field('const_redirect')) {
        let servers = Lampa.Storage.get('location_servers') || [];
        if (servers.length > 0) {
            window.location.href = server_protocol + servers[0];
        }
    }

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startMe();
            }
        });
    }
})();

