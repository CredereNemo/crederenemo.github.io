(function() {
    'use strict';

    Lampa.Platform.tv();

    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13 21.75C13.4142 21.75 13.75 21.4142 13.75 21C13.75 20.5858 13.4142 20.25 13 20.25V21.75ZM3.17157 19.8284L3.7019 19.2981H3.7019L3.17157 19.8284ZM20.8284 4.17157L20.2981 4.7019V4.7019L20.8284 4.17157ZM21.25 13C21.25 13.4142 21.5858 13.75 22 13.75C22.4142 13.75 22.75 13.4142 22.75 13H21.25ZM10 3.75H14V2.25H10V3.75ZM2.75 13V12H1.25V13H2.75ZM13 20.25H10V21.75H13V20.25ZM21.25 11V12H22.75V11H21.25ZM1.25 13C1.25 14.8644 1.24841 16.3382 1.40313 17.489C1.56076 18.6614 1.89288 19.6104 2.64124 20.3588L3.7019 19.2981C3.27869 18.8749 3.02502 18.2952 2.88976 17.2892C2.75159 16.2615 2.75 14.9068 2.75 13H1.25Z"></path></svg>';

    function loadServers() {
        return JSON.parse(Lampa.Storage.get('server_list') || '[]');
    }

    function saveServers(servers) {
        Lampa.Storage.set('server_list', JSON.stringify(servers));
    }

    function renderServerList() {
        var servers = loadServers();
        var listContainer = $('#server_list');
        listContainer.empty();

        if (servers.length === 0) {
            listContainer.append('<div class="empty">Нет доступных серверов</div>');
            return;
        }

        servers.forEach(function(server, index) {
            var item = $('<div class="server-item selector" data-index="' + index + '">' + server.name + '</div>');
            item.on('click', function() {
                window.location.href = server_protocol + server.url;
            });
            listContainer.append(item);
        });
    }

    function addServer(name, url) {
        var servers = loadServers();
        servers.push({ name: name, url: url });
        saveServers(servers);
        renderServerList();
    }

    function setupUI() {
        var menuHtml = '<div id="server_list"></div>';
        Lampa.Modal.open({
            title: 'Выберите сервер',
            html: menuHtml,
            onStart: renderServerList
        });
    }

    $(document).on('click', '#REDIRECT', function() {
        setupUI();
    });

    $(document).on('click', '#add_server_btn', function() {
        var name = prompt('Введите название сервера');
        var url = prompt('Введите URL сервера');
        if (name && url) addServer(name, url);
    });

    function createRedirectButton() {
        $('#REDIRECT').remove();
        var buttonHtml = '<div id="REDIRECT" class="head__action selector">' + icon_server_redirect + '</div>';
        $('.head__actions').append(buttonHtml);
    }

    createRedirectButton();
})();
