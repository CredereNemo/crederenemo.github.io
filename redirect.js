(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = JSON.parse(Lampa.Storage.get('servers_list') || '[]');

    function startMe() {
        $('#REDIRECT').remove();
        var iconHtml = '<div id="REDIRECT" class="head__action selector redirect-screen">' +
                       '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
                       '<path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75Z" fill="currentColor"></path>' +
                       '</svg>' +
                       '</div>';
        $('#app > div.head > div > div.head__actions').append(iconHtml);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            if (servers.length > 1) {
                Lampa.Select.show({
                    title: 'Выберите сервер',
                    items: servers.map((server, index) => ({
                        title: server.name + (server.available ? ' ✅' : ' ❌'),
                        index: index
                    })),
                    onSelect: (item) => {
                        window.location.href = server_protocol + servers[item.index].url;
                    }
                });
            } else if (servers.length === 1) {
                window.location.href = server_protocol + servers[0].url;
            }
        });
    }

    function checkServerAvailability(url, callback) {
        fetch(server_protocol + url, { method: 'HEAD' })
            .then(() => callback(true))
            .catch(() => callback(false));
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: ''
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'servers_list',
            type: 'button',
            values: '',
            placeholder: '',
            default: ''
        },
        field: {
            name: 'Список серверов',
            description: 'Добавьте несколько серверов и выберите нужный при смене'
        },
        onClick: function () {
            Lampa.Modal.open({
                title: 'Настройки серверов',
                html: '<div id="server_list"></div><button id="add_server">Добавить сервер</button>',
                size: 'medium',
                onOpen: function () {
                    var list = $('#server_list');
                    list.empty();
                    servers.forEach((server, index) => {
                        var item = $('<div>' + server.name + ' (' + server.url + ') ' + (server.available ? '✅' : '❌') + '</div>');
                        var removeBtn = $('<button>Удалить</button>').on('click', function() {
                            servers.splice(index, 1);
                            Lampa.Storage.set('servers_list', JSON.stringify(servers));
                            $(this).parent().remove();
                        });
                        item.append(removeBtn);
                        list.append(item);
                    });

                    $('#add_server').on('click', function () {
                        Lampa.Input.show({
                            title: 'Добавить сервер',
                            value: '',
                            placeholder: 'Введите URL',
                            onSelect: function (url) {
                                if (!url) return;
                                Lampa.Input.show({
                                    title: 'Название сервера',
                                    value: '',
                                    placeholder: 'Введите название',
                                    onSelect: function (name) {
                                        if (!name) return;
                                        checkServerAvailability(url, function (available) {
                                            servers.push({ name, url, available });
                                            Lampa.Storage.set('servers_list', JSON.stringify(servers));
                                            Lampa.Modal.close();
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }
    });

    if (Lampa.Storage.field('const_redirect') === true && servers.length > 0) {
        window.location.href = server_protocol + servers[0].url;
    }

    if (window.appready) startMe();
    else {
        Lampa.Listener.follow('app', function(e) {
            if(e.type == 'ready') startMe();
        });
    }

})();
