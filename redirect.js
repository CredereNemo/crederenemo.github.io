(function() {
	'use strict';

	Lampa.Platform.tv();

	const server_protocol = location.protocol === "https:" ? 'https://' : 'http://';
	const icon_server_redirect = `<svg width="256px" height="256px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <!-- SVG-код иконки -->
    </svg>`;

	function startMe() {
		if ($('#REDIRECT').length || !Lampa.Storage.get('location_server')) return;

		const domainBUTT = `<div id="REDIRECT" class="head__action selector redirect-screen">${icon_server_redirect}</div>`;
		$('div.head__actions').append(domainBUTT);

		$('#REDIRECT').on('click hover:enter hover:touch', function() {
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
			if (value) startMe();
			else $('#REDIRECT').remove();
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
			description: 'Внимание! Если включить этот параметр, вернуться на старый сервер можно будет только сбросом плагинов или отключением через CUB'
		}
	});

	if (Lampa.Storage.field('const_redirect'))
		window.location.href = server_protocol + Lampa.Storage.get('location_server');

	Lampa.Listener.follow('app', (e) => {
		if (e.type === 'ready') startMe();
	});

})();
