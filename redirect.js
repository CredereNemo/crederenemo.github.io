(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('server_list') || [];
    
    function updateUI() {
        $('#REDIRECT').remove();
        if (servers.length > 0) {
            var domainSVG = '<svg>...</svg>'; // Здесь ваш SVG-код
            var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + domainSVG + '</div>';
            $('#app > div.head > div > div.head__actions').append(domainBUTT);
            $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
            
            $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
                if (servers.length === 1) {
                    window.location.href = server_protocol + servers[0].url;
                } else {
                    showServerSelection();
                }
            });
        }
    }
    
    function showServerSelection() {
        var list = [];
        servers.forEach((server, index) => {
            list.push({
                title: server.name + ' (' + server.url + ')',
                onSelect: function() {
                    window.location.href = server_protocol + server.url;
                }
            });
        });
        Lampa.Select.show({
            title: 'Выберите сервер',
            items: list,
            onBack: function() {
                Lampa.Controller.toggle('content');
            }
        });
    }
    
    function addServer(name, url) {
        if (!name || !url) return;
        servers.push({ name: name, url: url });
        Lampa.Storage.set('server_list', servers);
        updateUI();
    }
    
    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: '<svg>...</svg>' // Ваш SVG
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'add_server',
            type: 'button',
            values: '',
            default: '',
        },
        field: {
            name: 'Добавить сервер',
            description: 'Введите название и URL сервера'
        },
        onChange: function() {
            Lampa.Input.open({
                title: 'Добавить сервер',
                placeholder: 'Название',
                onEnter: function(name) {
                    Lampa.Input.open({
                        title: 'Введите URL',
                        placeholder: 'example.com',
                        onEnter: function(url) {
                            addServer(name, url);
                        }
                    });
                }
            });
        }
    });
    
    updateUI();
})();
