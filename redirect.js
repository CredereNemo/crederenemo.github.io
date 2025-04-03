(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75Z" fill="currentColor"></path> </svg>';
    
    function loadServers() {
        return JSON.parse(Lampa.Storage.get('location_servers') || '[]');
    }

    function saveServers(servers) {
        Lampa.Storage.set('location_servers', JSON.stringify(servers));
    }

    function startMe() {
        $('#REDIRECT').remove();
        var servers = loadServers();
        if (servers.length === 0) return;
        
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            if (servers.length === 1) {
                window.location.href = server_protocol + servers[0].url;
            } else {
                showServerMenu(servers);
            }
        });
    }
    
    function showServerMenu(servers) {
        var list = [];
        servers.forEach(function(server, index) {
            list.push({
                title: server.name,
                subtitle: server.url,
                onClick: function() {
                    window.location.href = server_protocol + server.url;
                }
            });
        });
        Lampa.Select.show({
            title: "Выберите сервер",
            items: list,
            onBack: function() {
                Lampa.Controller.toggle("content");
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
            description: 'Добавьте несколько серверов для переключения'
        },
        onClick: function() {
            Lampa.Modal.input({
                title: 'Добавить сервер',
                placeholder: 'Введите имя сервера',
                onSelect: function(serverName) {
                    if (!serverName) return;
                    Lampa.Modal.input({
                        title: 'Введите адрес сервера',
                        placeholder: 'Например: lampa.surge.sh',
                        onSelect: function(serverUrl) {
                            if (!serverUrl) return;
                            var servers = loadServers();
                            servers.push({ name: serverName, url: serverUrl });
                            saveServers(servers);
                            startMe();
                        }
                    });
                }
            });
        }
    });

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startMe();
            }
        });
    }
})();
