$(function () {
	document.getElementById("hamburger").addEventListener("click", () => {
		$(".sidenav-fixed").toggle();

		$("#mainDiv").toggleClass("fullDiv");
	});

	$(".sidebar-menu > li > a.collapsible-header").click(function () {
		$(".sidebar-menu > li > a.active:not(.collapsible-header)")
			.parent()
			.removeClass("active");
		$(".sidebar-menu > li > a.active:not(.collapsible-header)").removeClass(
			"active"
		);
	});

	$(".collapsible").collapsible();
	$("select").formSelect();
});
