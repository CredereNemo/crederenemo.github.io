(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">...</svg>';

    function startMe() {
        $('#REDIRECT').remove();
        
        if (!Lampa.Storage.get('servers') || Lampa.Storage.get('servers').length === 0) return;
        
        var domainSVG = icon_server_redirect;
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';
        
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            showServerMenu();
        });
    }

    function showServerMenu() {
        var servers = Lampa.Storage.get('servers') || [];
        if (servers.length === 0) return;

        var items = servers.map(function(server, index) {
            return {
                title: server.name + ' (' + server.address + ')',
                index: index
            };
        });

        Lampa.Select.show({
            title: 'Выберите сервер',
            items: items,
            onSelect: function(item) {
                var selectedServer = servers[item.index];
                window.location.href = server_protocol + selectedServer.address;
            },
            onBack: function() {
                Lampa.Controller.back();
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
            name: 'servers',
            type: 'button',
            values: '',
            placeholder: 'Управление серверами',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Добавьте, удалите или выберите сервер'
        },
        onChange: function () {
            manageServers();
        }
    });

    function manageServers() {
        var servers = Lampa.Storage.get('servers') || [];
        var items = servers.map(function(server, index) {
            return {
                title: server.name + ' (' + server.address + ')',
                index: index,
                remove: true
            };
        });

        items.push({
            title: 'Добавить сервер',
            add: true
        });

        Lampa.Select.show({
            title: 'Управление серверами',
            items: items,
            onSelect: function(item) {
                if (item.add) {
                    addServer();
                } else {
                    servers.splice(item.index, 1);
                    Lampa.Storage.set('servers', servers);
                    manageServers();
                }
            },
            onBack: function() {
                Lampa.Controller.back();
            }
        });
    }

    function addServer() {
        Lampa.Input.show({
            title: 'Добавить сервер',
            placeholder: 'Введите имя сервера',
            onEnter: function(name) {
                Lampa.Input.show({
                    title: 'Введите адрес сервера',
                    placeholder: 'Например: lampa.surge.sh',
                    onEnter: function(address) {
                        var servers = Lampa.Storage.get('servers') || [];
                        servers.push({ name: name, address: address });
                        Lampa.Storage.set('servers', servers);
                        manageServers();
                    }
                });
            }
        });
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
