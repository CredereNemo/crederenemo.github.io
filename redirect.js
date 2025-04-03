(function() {
    'use strict';

    Lampa.Platform.tv();
    
    var server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
    var icon_server_redirect = '<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">...</svg>';

    function startMe() {
        $('#REDIRECT').remove();
        
        if (!Lampa.Storage.get('location_server')) return;
        
        var domainBUTT = '<div id="REDIRECT" class="head__action selector redirect-screen">' + icon_server_redirect + '</div>';
        $('#app > div.head > div > div.head__actions').append(domainBUTT);
        $('#REDIRECT').insertAfter('div[class="head__action selector open--settings"]');
        
        $('#REDIRECT').on('hover:enter hover:click hover:touch', function() {
            window.location.href = server_protocol + Lampa.Storage.get('location_server');
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
            name: 'location_server',
            type: 'input', 
            values: '',
            placeholder: 'Например: lampa.surge.sh',
            default: ''
        },
        field: {
            name: 'Адрес сервера',
            description: 'Нажмите для ввода, смену сервера можно будет сделать кнопкой в верхнем баре'
        },
        onChange: function(value) {
            if (!value) {
                $('#REDIRECT').remove();
            } else {
                startMe();
            }
        }         
    });
    
    Lampa.SettingsApi.addParam({
        component: 'location_redirect',
        param: {
            name: 'const_redirect',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Постоянный редирект',
            description: 'Внимание!!! Если вы включите этот параметр, вернуться на старый сервер сможете только сбросом плагинов или отключением этого плагина через CUB'
        }
    });
    
    if (Lampa.Storage.field('const_redirect')) {
        window.location.href = server_protocol + Lampa.Storage.get('location_server');
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
