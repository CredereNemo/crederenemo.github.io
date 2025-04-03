(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('location_servers') || [];

    function updateServerListUI() {
        var menu = $('#server-list');
        menu.empty();
        servers.forEach(function(server, index) {
            var status = server.status ? '🟢' : '🔴';
            var item = $('<div class="server-item selector" data-index="' + index + '">' + status + ' ' + server.name + '</div>');
            item.on('hover:enter', function() {
                Lampa.Storage.set('location_server', server.url);
                window.location.href = server_protocol + server.url;
            });
            menu.append(item);
        });
    }

    function checkServerStatus(server, callback) {
        $.ajax({
            url: server_protocol + server.url,
            type: 'HEAD',
            timeout: 3000,
            success: function() { callback(true); },
            error: function() { callback(false); }
        });
    }

    function addServer() {
        var name = prompt("Введите название сервера");
        var url = prompt("Введите адрес сервера");
        if (name && url) {
            var newServer = { name: name, url: url, status: false };
            checkServerStatus(newServer, function(status) {
                newServer.status = status;
                servers.push(newServer);
                Lampa.Storage.set('location_servers', servers);
                updateServerListUI();
            });
        }
    }

    function startMe() {
        $('#REDIRECT').remove();
        if (servers.length === 0) return;
        var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">...</svg>';
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        $('#REDIRECT').on('hover:enter', function() {
            if (servers.length > 1) {
                Lampa.Settings.create({
                    title: 'Выбор сервера',
                    items: [
                        { title: 'Добавить сервер', onClick: addServer }
                    ],
                    onBack: function() { Lampa.Settings.back(); }
                });
                updateServerListUI();
            } else {
                window.location.href = server_protocol + servers[0].url;
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: '<svg>...</svg>'
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'location_servers',
            type: 'button',
            values: '',
            default: '',
            onClick: addServer
        },
        field: {
            name: 'Список серверов',
            description: 'Добавьте или выберите сервер'
        }
    });

    if (Lampa.Storage.field('const_redirect') === true && servers.length > 0) {
        window.location.href = server_protocol + servers[0].url;
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
