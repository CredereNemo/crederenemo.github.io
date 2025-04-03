(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('server_list', []);

    function saveServers() {
        Lampa.Storage.set('server_list', servers);
    }

    function startMe() {
        $('#REDIRECT').remove();
        if (servers.length === 0) return;

        var domainSVG = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25Z"></path></svg>';
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';

        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            if (servers.length > 1) {
                showServerMenu();
            } else {
                window.location.href = server_protocol + servers[0].url;
            }
        });
    }

    function showServerMenu() {
        var list = Lampa.Detailed({ title: 'Выбор сервера' });

        servers.forEach(function(server, index) {
            list.append({
                title: server.name + ' (' + server.url + ')',
                onclick: function() {
                    Lampa.Storage.set('current_server', server.url);
                    window.location.href = server_protocol + server.url;
                }
            });
        });

        list.append({
            title: 'Добавить сервер',
            onclick: function() {
                addServer();
            }
        });

        Lampa.Activity.push({ component: list });
    }

    function addServer() {
        Lampa.Input({ title: 'Добавить сервер', placeholder: 'Введите URL сервера' }, function(url) {
            if (url) {
                Lampa.Input({ title: 'Название сервера', placeholder: 'Введите имя' }, function(name) {
                    servers.push({ name: name || 'Без имени', url: url });
                    saveServers();
                    startMe();
                });
            }
        });
    }

    Lampa.SettingsApi.addComponent({
        component: 'server_management',
        name: 'Управление серверами',
        icon: '<svg width="24" height="24"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="none" /></svg>'
    });

    Lampa.SettingsApi.addParam({
        component: 'server_management',
        param: {
            name: 'server_list',
            type: 'button',
            values: '',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Просмотр и управление серверами'
        },
        onChange: function() {
            showServerMenu();
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
