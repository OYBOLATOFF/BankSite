// Подсвечивание выбранного пункта в хедере(не в мобильном)
$('.header__menu_link').hover(function () {
        $(this).toggleClass('active');
    }, function () {
        $(this).toggleClass('active');
    }
);

$('.header__burger').click(function (e) { 
    $(this).toggleClass('active'); // Активирую бургер, меняю его
    $('.menu_for_mobile').toggleClass('active'); // Активирую меню для мобилки, чтоб съехало вниз
    $('.header__nav').toggleClass('fixed'); // Фиксирую хедер, чтоб не смещался
    $('body').toggleClass('lock');

    if ( !$('.menu_for_mobile').hasClass('active') ) {
        $('.description').slideUp();
    }
});

$('.menu_for_mobile li').hover(function () {
        $(this).toggleClass('active');
    }, function () {
        $(this).toggleClass('active');
    }
);

$('.menu_for_mobile__link').children('p').click(function (e) { 
    $('.menu_for_mobile__link').not( $(this).parent('.menu_for_mobile__link') ).find('.description').slideUp();
    $( $(this).parent('.menu_for_mobile__link') ).find('.description').slideToggle();
});


// Выбор тарифа
$('.tariff_item').click(function (e) {
    $('.tariff_item.active').toggleClass('active');
    $(this).toggleClass('active');

    var $termsToShow = $(this).hasClass('optimal')? $('.optimal_terms'): ( $(this).hasClass('super')? $('.super_terms'): ( $(this).hasClass('simplified') )? $('.simplified_terms'): ( $(this).hasClass('simple')? $('.simple_terms'): this ) );
    $('.terms').css({'display': 'none', 'opacity': '0'});
    $($termsToShow).css({'display': 'block', 'opacity': '1'});
    changeConditionForForm();
    calculateResults();
});

// Изменение атрибутов для форм в зависимости от тарифа
function changeConditionForForm() {
    var activeClass = $('.tariff_item.active').attr('class').split(' ')[0];
    var productCap = conditions['productCap'][activeClass]; // Процент рассрочки
    var maxSumOfDeal = conditions['maxSumOfDeal'][activeClass]; // Максимальный размер сделки
    var maxPeriod = conditions['maxPeriod'][activeClass]; // Максимальный период рассрочки

    $('input[name="valueOfGoodInput"]').attr('max', maxSumOfDeal);
    $('input[name="valueOfGoodRange"]').attr('max', maxSumOfDeal);
    var currentSumOfDeal = $('input[name="valueOfGoodInput"]').val();
    if (currentSumOfDeal > maxSumOfDeal) {
        $('input[name="valueOfGoodInput"]').val(maxSumOfDeal);
        calculateDownPayment();
    }

    // Изменяем выпадающий список с месяцами рассрочки
    $('select[name="duration_of_installment"]').html('');
    for (var i = 1; i <= maxPeriod; i++) {
        $('select[name="duration_of_installment"]').append(`<option value="${i}">${i}</option>`);
    }
}

function calculateDownPayment() {
    var currentDownPayment = $('input[name="downPaymentInput"]').val();
    var minDownPayment = $('input[name="valueOfGoodInput"]').val()*0.25;

    $('input[name="downPaymentInput"]').attr('max', minDownPayment*4);
    $('input[name="downPaymentRange"]').attr('max', minDownPayment*4);

    $('input[name="downPaymentInput"]').attr('min', minDownPayment);
    $('input[name="downPaymentRange"]').attr('min', minDownPayment);

    if (currentDownPayment < minDownPayment) {
        $('input[name="downPaymentInput"]').val(minDownPayment);
        $('input[name="downPaymentRange"]').val(minDownPayment);
    }
    if (currentDownPayment > minDownPayment*4) {
        $('input[name="downPaymentInput"]').val(minDownPayment*4);
    }
}

// Функция расчёта итоговых показателей
function calculateResults() {
    var activeClass = $('.tariff_item.active').attr('class').split(' ')[0]; // Текущий тариф

    var initialCostOfGood = $('input[name="valueOfGoodInput"]').val(); // Первоначальная стоимость товара
    var downPayment = $('input[name="downPaymentInput"]').val(); // Первоначальный взнос
    var durationOfInstallment = $('select[name="duration_of_installment"]').val(); // Срок рассрочки
    var percentOfInstallment = conditions['productCap'][activeClass]; // Процент рассрочки
    var installmentMarkup = Math.round((initialCostOfGood-downPayment)*durationOfInstallment*percentOfInstallment/100); // Наценка на рассрочку
    // var totalCostOfGood = Math.round(initialCostOfGood-downPayment+installmentMarkup); // Стоимость товара с учётом взноса и наценки
    var totalCostOfGood = Number(initialCostOfGood)+Number(installmentMarkup); // Стоимость товара с учётом взноса и наценки
    var monthlyPayment = Math.round((totalCostOfGood-downPayment)/durationOfInstallment); // Ежемесячный платёж

    $('span[id="monthlyPayment"]').text(`${monthlyPayment}р`); // Меняем поле с ежемесячным платежом
    $('span[id="installmentMarkup"]').text(`${installmentMarkup}р`); // Меняем поле с наценкой на рассрочку
    $('span[id="totalCostOfGood"]').text(`${totalCostOfGood}р`); // Меняем поле с общей стоимостью
}

// Изменение поля с ценой товара
$('input[name="valueOfGoodInput"]').on('input', function () {
    $('input[name="valueOfGoodRange"]').val( $(this).val() );
    calculateDownPayment();
    calculateResults();
});

// Изменение ползунка с ценой товара
$('input[name="valueOfGoodRange"]').on('input', function () {
    $('input[name="valueOfGoodInput"]').val( $(this).val() );
    calculateDownPayment();
    calculateResults();
});


// Изменение поля со взносом
$('input[name="downPaymentInput"]').on('input', function () {
    $('input[name="downPaymentRange"]').val( $(this).val() );
    calculateResults();
});

// Изменение ползунка со взносом
$('input[name="downPaymentRange"]').on('input', function () {
    $('input[name="downPaymentInput"]').val( $(this).val() );
    calculateResults();
});

// Изменение срока рассрочки
$('select[name="duration_of_installment"]').on('input', function () {
    calculateResults();
});

// Таблица с условиями тарифов
let conditions = {
    'productCap': {
        'super': 2.8,
        'optimal': 3,
        'simplified': 3.4,
        'simple': 3.8
    },

    'maxSumOfDeal': {
        'super': 500000,
        'optimal': 500000,
        'simplified': 150000,
        'simple': 100000
    },

    'maxPeriod': {
        'super': 12,
        'optimal': 12,
        'simplified': 6,
        'simple': 3
    }
};

let tariff_titles = {
    'simple': 'Простой',
    'simplified': 'Упрощённый',
    'optimal': 'Оптимальный',
    'super': 'Супер'
}

// Нажатие на галочку соглашения
$('#agreement').change(function (e) { 
    $('.calculator__request_button').toggleClass('active');
});

// Нажатие на зелёную кнопку соглашения в popup
$('.agree_with_rules_btn').on('click', function () {
    $('.popup.agreement').addClass('hidden');
    $('body').removeClass('blocked');

    if (!$('#agree-checkbox').is(':checked')) {
        $('#agree-checkbox').prop('checked', 'true');
        $('.calculator__request_button').toggleClass('active');
    }
});

// Всплытие попапа при нажатии на текст "Политикой конфиденциальности"
$('#confident_policy_href').on('click', function () {
    $('.popup.agreement').removeClass('hidden');
    $('body').addClass('blocked');
});

$('.popup__background').on('click', function () {
    $('.popup.agreement').addClass('hidden');
    $('body').removeClass('blocked');
});

// При нажатии на кнопку "Заполнить анкету"
$('.calculator__request_button').click(function (e) { 
    // var activeClass = $('.tariff_item.active').attr('class').split(' ')[0]; // Текущий тариф
    // var initialCostOfGood = Number($('input[name="valueOfGoodInput"]').val()); // Первоначальная стоимость товара
    // var downPayment = Number($('input[name="downPaymentInput"]').val()); // Первоначальный взнос (аванс)
    // var durationOfInstallment = Number($('select[name="duration_of_installment"]').val()); // Срок рассрочки
    // var percentOfInstallment = conditions['productCap'][activeClass]; // Процент рассрочки

    // for (i = 0; i < 8; i++) {
    //     if (i > 3) {
    //         // $('.b24-form-control').eq(i).attr('disabled', 'disabled');
    //         $('.b24-form-control').eq(i).addClass('b24-form-control-not-empty');
    //     }
    // }

    // $('.b24-form-control').eq(4).val(initialCostOfGood); // Устанавливаем стоимость
    // $('.b24-form-control').eq(5).val(downPayment); // Устанавливаем взнос
    // $('.b24-form-control').eq(6).val(durationOfInstallment); // Устанавливаем срок
    // $('.b24-form-control').eq(7).val(tariff_titles[activeClass]); // Устанавливаем тариф
    
    if ($(this).hasClass('active')) {
        $('.request_form').toggleClass('active');
        $('body').addClass('blocked');
    } else {
        alert('Вам нужно согласиться с политикой конфиденциальности чуть ниже')
    }
});

$('.request_form_bg').click(function (e) { 
    $(this).parent('.request_form').removeClass('active');
    $('body').removeClass('blocked');
});

$(document).ready(function () {
    changeConditionForForm();
    calculateDownPayment();

    $('.tariff_item.super').click();
});

var $container = $("html,body");

// Скролл при нажатии на кнопку "Схема работы"
$('.work_scheme_link').click(function (e) {
    var $scrollTo = $('.content__work_scheme');
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $container.animate({scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()-250, scrollLeft: 0}, 1);
});

// Скролл при нажатии на кнопку "Вопрос-ответ"
$('.question_answer_link').click(function (e) { 
    var $scrollTo = $('.content__questions');
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $container.animate({scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()-250, scrollLeft: 0}, 1);
});

$('.contacts_link').click(function (e) { 
    var $scrollTo = $('.contacts_info');
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    $container.animate({scrollTop: $scrollTo.offset().top - $container.offset().top + $container.scrollTop()-250, scrollLeft: 0}, 1);
});

// Нажатие на вопрос для получения ответа
$('.questions_item').click(function (e) { 
    $(this).find('.question_explanation').slideToggle();
    $(this).toggleClass('active');
});

// Отслеживание скролла для видимости хедера
var block_show = null;
function scrollTracking(){
	var wt = $(window).scrollTop();
	var wh = $(window).height();
	var et = $('.header__nav').offset().top;
	var eh = $('.header__nav').outerHeight();
 
	if (wt + wh >= et && wt + wh - eh * 2 <= et + (wh - eh)){
		if (block_show == null || block_show == false) {
			$('.header_for_scroll').removeClass('active');
		}
		block_show = true;
	} else {
		if (block_show == null || block_show == true) {
			$('.header_for_scroll').addClass('active');
		}
		block_show = false;
	}
}
 
$(window).scroll(function(){
	scrollTracking();
});