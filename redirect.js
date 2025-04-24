(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" height="24" width="24" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
    </svg>`;

    // Функция для нормализации и исправления URL
    function sanitizeUrl(url) {
        url = url.trim().toLowerCase();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = server_protocol + url;
        }
        return url;
    }

    // Функция для создания кнопки и отображения
    function startRedirectButton() {
        $('#REDIRECT').remove(); // Удаляем старую кнопку

        var servers = Lampa.Storage.get('location_servers') || [];
        if (!servers.length) return; // Если нет серверов, не создаем кнопку
        
        // Создаем кнопку с иконкой
        var buttonHtml = '<div id="REDIRECT" class="head__action selector redirect-screen" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">' + icon_server_redirect + '</div>';

        
        // Добавляем кнопку в меню
        $('.head__actions').append(buttonHtml);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');

        // Обработчик для клика по кнопке
        $('#REDIRECT').on('hover:enter', function() {
            openServerSelection();
        });
    }

    // Функция для открытия выбора сервера
    function openServerSelection() {
        var servers = (Lampa.Storage.get('location_servers') || []).map(sanitizeUrl); // Обрабатываем адреса серверов

        if (!servers.length) {
            Lampa.Noty.show('Нет доступных серверов');
            return;
        }

        if (servers.length === 1) {
            window.location.href = servers[0];
            return;
        }

        // Создаем список серверов для выбора
        var options = servers.map(server => ({
            title: server,
            callback: () => {
                window.location.href = server;
            }
        }));

        // Открываем выбор сервера
        Lampa.Select.show({
            title: 'Выберите сервер',
            items: options,
            onSelect: (item) => item.callback()
        });
    }

    // Настройки для добавления серверов через настройки
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
            placeholder: 'Введите адреса через запятую',
            default: ''
        },
        field: {
            name: 'Серверы',
            description: 'Введите серверы через запятую для выбора'
        },
        onChange: function (value) {
            var servers = value.split(',')
                .map(s => s.trim().toLowerCase())  // Приводим к нижнему регистру
                .filter(Boolean);

            Lampa.Storage.set('location_servers', servers);
            startRedirectButton();
        }
    });

    // Запуск кнопки, когда приложение готово
    if (window.appready) startRedirectButton();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startRedirectButton();
        });
    }
})();
