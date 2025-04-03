(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var servers = Lampa.Storage.get('server_list') || [];

    function updateServerListUI() {
        var listContainer = $('#server_list');
        listContainer.empty();

        servers.forEach((server, index) => {
            var item = $('<div class="server-item selector">' + server.name + ' (' + server.address + ')</div>');
            item.on('hover:enter', function() {
                Lampa.Storage.set('current_server', server.address);
                window.location.href = server_protocol + server.address;
            });
            listContainer.append(item);
        });
    }

    function addServer(name, address) {
        servers.push({ name: name, address: address });
        Lampa.Storage.set('server_list', servers);
        updateServerListUI();
    }

    function openServerManagement() {
        var modal = $('<div class="server-management"><h2>Управление серверами</h2></div>');
        var addButton = $('<button class="add-server">Добавить сервер</button>');
        var listContainer = $('<div id="server_list"></div>');
        
        addButton.on('click', function() {
            var name = prompt('Введите название сервера');
            var address = prompt('Введите адрес сервера');
            if (name && address) {
                addServer(name, address);
            }
        });

        modal.append(listContainer);
        modal.append(addButton);
        $('body').append(modal);
        updateServerListUI();
    }

    Lampa.SettingsApi.addComponent({
        component: 'location_redirect',
        name: 'Смена сервера',
        icon: ''
    });

    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'server_management',
            type: 'button'
        },
        field: {
            name: 'Управление серверами',
            description: 'Добавить или выбрать сервер'
        },
        onChange: openServerManagement
    });

    if (Lampa.Storage.get('current_server')) {
        var switchButton = $('<div id="REDIRECT" class="head__action selector">Сменить сервер</div>');
        switchButton.on('hover:enter', function() {
            openServerManagement();
        });
        $('#app > div.head > div > div.head__actions').append(switchButton);
    }
})();
