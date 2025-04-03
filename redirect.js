(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284Z"/> </svg>';
    
    function openServerSelection() {
        var servers = Lampa.Storage.get('location_servers') || [];
        if (!servers.length) return;
        
        var list = servers.map(server => {
            return {
                title: server,
                click: () => {
                    window.location.href = server_protocol + server;
                }
            };
        });
        
        Lampa.Modal.open({
            title: 'Выбор сервера',
            html: '',
            size: 'medium',
            buttons: list
        });
    }
    
    function startMe() {
        $('#REDIRECT').remove();
        var button = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(button);
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', openServerSelection);
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
            type: 'input',
            values: '',
            placeholder: 'Введите сервера через запятую',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Введите адреса серверов через запятую, затем сохраните настройки'
        },
        onChange: function(value) {
            var servers = value.split(',').map(s => s.trim()).filter(s => s);
            Lampa.Storage.set('location_servers', servers);
            startMe();
        }
    });
    
    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') {
                startMe();
            }
        });
    }
})();
