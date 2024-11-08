/** @format */

(function ($) {
	$.fn.mauGallery = function (options) {
		var options = $.extend($.fn.mauGallery.defaults, options);
		var tagsCollection = [];
		return this.each(function () {
			$.fn.mauGallery.methods.createRowWrapper($(this));
			if (options.lightBox) {
				$.fn.mauGallery.methods.createLightBox(
					$(this),
					options.lightboxId,
					options.navigation
				);
			}
			$.fn.mauGallery.listeners(options);

			$(this)
				.children(".gallery-item")
				.each(function (index) {
					$.fn.mauGallery.methods.responsiveImageItem($(this));
					$.fn.mauGallery.methods.moveItemInRowWrapper($(this));
					$.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
					var theTag = $(this).data("gallery-tag");
					if (
						options.showTags &&
						theTag !== undefined &&
						tagsCollection.indexOf(theTag) === -1
					) {
						tagsCollection.push(theTag);
					}
				});

			if (options.showTags) {
				$.fn.mauGallery.methods.showItemTags(
					$(this),
					options.tagsPosition,
					tagsCollection
				);
			}

			$(this).fadeIn(500);
		});
	};
	$.fn.mauGallery.defaults = {
		columns: 3,
		lightBox: true,
		lightboxId: "galleryLightbox",
		showTags: true,
		tagsPosition: "bottom",
		navigation: true,
	};

	$.fn.mauGallery.listeners = function (options) {
		// Gestion des événements pour les images de la galerie
		$(".gallery").on("click keypress", ".item-column", function (e) {
			if (e.type === "click" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				const imgElement = $(this).find(".gallery-item");
				if (options.lightBox && imgElement.prop("tagName") === "IMG") {
					$.fn.mauGallery.methods.openLightBox(imgElement, options.lightboxId);
				}
			}
		});

		// Gestion des événements pour les filtres
		$(".gallery").on("click keypress", ".nav-link", function (e) {
			if (e.type === "click" || e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				$.fn.mauGallery.methods.filterByTag.call(this);
			}
		});

		// Gestion des événements pour la navigation dans la LightBox
		$(".gallery").on("click keydown", ".mg-prev, .mg-next", function (e) {
			if (
				e.type === "click" ||
				(e.type === "keydown" && (e.key === "Enter" || e.key === " "))
			) {
				e.preventDefault();
				if ($(this).hasClass("mg-prev")) {
					$.fn.mauGallery.methods.prevImage(options.lightboxId);
				} else {
					$.fn.mauGallery.methods.nextImage(options.lightboxId);
				}
			}
		});

		// Gestion des flèches gauche et droite pour naviguer dans la LightBox
		$(document).on("keydown", function (e) {
			if ($("#" + options.lightboxId).hasClass("show")) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					$.fn.mauGallery.methods.prevImage(options.lightboxId);
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					$.fn.mauGallery.methods.nextImage(options.lightboxId);
				}
			}
		});
	};

	$.fn.mauGallery.methods = {
		createRowWrapper(element) {
			if (!element.children().first().hasClass("row")) {
				element.append('<div class="gallery-items-row row "></div>');
			}
		},
		wrapItemInColumn(element, columns) {
			if (columns.constructor === Number) {
				element.wrap(
					`<div class='item-column mb-4 col-${Math.ceil(
						12 / columns
					)}' tabindex='0' role='button' aria-label='Ouvrir l'image dans la galerie'></div>`
				);
				// Supprimez les attributs de l'image pour éviter le double focus
				element.removeAttr("tabindex role aria-label");
			} else if (columns.constructor === Object) {
				var columnClasses = "";
				if (columns.xs) {
					columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
				}
				if (columns.sm) {
					columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
				}
				if (columns.md) {
					columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
				}
				if (columns.lg) {
					columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
				}
				if (columns.xl) {
					columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
				}

				// Ajoutez les attributs au conteneur
				element.wrap(
					`<div class='item-column mb-4${columnClasses}' tabindex='0' role='button' aria-label='Ouvrir l'image dans la galerie'></div>`
				);
				// Supprimez les attributs de l'image
				element.removeAttr("tabindex role aria-label");
			} else {
				console.error(
					`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
				);
			}
		},
		moveItemInRowWrapper(element) {
			element.appendTo(".gallery-items-row");
		},
		responsiveImageItem(element) {
			if (element.prop("tagName") === "IMG") {
				element.addClass("img-fluid");
			}
		},
		openLightBox(element, lightboxId) {
			const modal = $(`#${lightboxId}`);
			modal.find(".lightboxImage").attr("src", element.attr("src"));
			modal.modal("toggle");
			// Placer le focus sur le modal
			modal.focus();
		},

		prevImage() {
			let activeImage = null;
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});
			let activeTag = $(".tags-bar .nav-link.active-tag").data("images-toggle");

			let imagesCollection = [];
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
			} else {
				$(".item-column").each(function () {
					if ($(this).children("img").data("gallery-tag") === activeTag) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i - 1;
				}
			});
			next =
				imagesCollection[index] ||
				imagesCollection[imagesCollection.length - 1];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},
		nextImage() {
			let activeImage = null;
			$("img.gallery-item").each(function () {
				if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
					activeImage = $(this);
				}
			});

			let activeTag = $(".tags-bar .nav-link.active-tag").data("images-toggle");

			let imagesCollection = [];
			if (activeTag === "all") {
				$(".item-column").each(function () {
					if ($(this).children("img").length) {
						imagesCollection.push($(this).children("img"));
					}
				});
			} else {
				$(".item-column").each(function () {
					if ($(this).children("img").data("gallery-tag") === activeTag) {
						imagesCollection.push($(this).children("img"));
					}
				});
			}
			let index = 0,
				next = null;

			$(imagesCollection).each(function (i) {
				if ($(activeImage).attr("src") === $(this).attr("src")) {
					index = i + 1;
				}
			});
			next = imagesCollection[index] || imagesCollection[0];
			$(".lightboxImage").attr("src", $(next).attr("src"));
		},

		createLightBox(gallery, lightboxId, navigation) {
			const closeBtn =
				'<button type="button" class="btn-close button-close" data-bs-dismiss="modal" aria-label="Fermer">X</button>';

			const prevBtn = navigation
				? '<button class="mg-prev arrow-prev" tabindex="0" aria-label="Image précédente" >&lt;</button>'
				: '<span style="display:none;"></span>';

			const nextBtn = navigation
				? '<button class="mg-next arrow-next" tabindex="0" aria-label="Image suivante" >&gt;</button>'
				: '<span style="display:none;"></span>';

			gallery.append(`<div class="modal fade" id="${
				lightboxId ? lightboxId : "galleryLightbox"
			}" tabindex="-1" role="dialog" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-body position-relative">
                ${closeBtn}
                ${prevBtn}
                    <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clic"/>
                    ${nextBtn}
                </div>
            </div>
        </div>
    </div>`);
		},

		showItemTags(gallery, position, tags) {
			var tagItems =
				'<li class="nav-item" role="presentation"><button class="nav-link active active-tag " tabindex="0" role="tab" data-images-toggle="all">Tous</button></li>';
			$.each(tags, function (index, value) {
				tagItems += `<li class="nav-item active" role="presentation">
                <button class="nav-link" tabindex="0" role="tab" data-images-toggle="${value}">${value}</button></li>`;
			});
			var tagsRow = `<ul class="my-4 tags-bar nav nav-pills" role="tablist">${tagItems}</ul>`;

			if (position === "bottom") {
				gallery.append(tagsRow);
			} else if (position === "top") {
				gallery.prepend(tagsRow);
			} else {
				console.error(`Unknown tags position: ${position}`);
			}
		},
		filterByTag() {
			if ($(this).hasClass("active-tag")) {
				return;
			}
			$(".active.active-tag").removeClass("active active-tag");
			$(this).addClass("active-tag active");

			var tag = $(this).data("images-toggle");

			$(".gallery-item").each(function () {
				$(this).parents(".item-column").hide();
				if (tag === "all") {
					$(this).parents(".item-column").show(300);
				} else if ($(this).data("gallery-tag") === tag) {
					$(this).parents(".item-column").show(300);
				}
			});
		},
	};
})(jQuery);
