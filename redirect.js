(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('servers_list') || [];

    function checkServerStatus(server, callback) {
        fetch(server_protocol + server, { method: 'HEAD', mode: 'no-cors' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    function updateServersUI() {
        var container = $('#servers_list');
        container.empty();

        if (servers.length === 0) {
            container.append('<div class="server-item">Нет доступных серверов</div>');
        } else {
            servers.forEach((server, index) => {
                var item = $('<div class="server-item selector" data-index="' + index + '">' + server.name + '</div>');
                checkServerStatus(server.url, function(isUp) {
                    if (!isUp) {
                        item.addClass('server-down');
                    }
                });
                item.on('hover:enter', function() {
                    Lampa.Storage.set('location_server', server.url);
                    window.location.href = server_protocol + server.url;
                });
                container.append(item);
            });
        }
    }

    function openServersMenu() {
        var modal = $('<div class="modal servers-menu"><div id="servers_list"></div><button id="add_server">Добавить сервер</button></div>');
        $('body').append(modal);
        updateServersUI();
        $('#add_server').on('click', function() {
            var name = prompt("Введите имя сервера");
            var url = prompt("Введите адрес сервера");
            if (name && url) {
                servers.push({ name: name, url: url });
                Lampa.Storage.set('servers_list', servers);
                updateServersUI();
            }
        });
    }

    function startMe() {
        $('#REDIRECT').remove();
        if (servers.length > 0) {
            var button = $('<div id="REDIRECT" class="head__action selector redirect-screen">🔄</div>');
            $('#app > div.head > div > div.head__actions').append(button);
            button.on('hover:enter', openServersMenu);
        }
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: '🔄'
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
