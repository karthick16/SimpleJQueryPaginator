(function( $ ) {

	// Default - Global variables
	var $datatable;
	var meta;
	var itemsPerPage = 10; // Default page size
    var defaultPage = 0;
    var numberOfPages;
	var source = '';
	var template = '';
	var showPagination;
	var extraParams = {};
	
	// Data grid method definitions
	var methods = {
    	
		// Default method
		init : function(options) { 

			$datatable = $(this);
			meta = $(this);
			
			source = options.source;
			template = $("#" + options.template);
			showPagination = options.pagination;
			
			if (options.pagesize) {
				itemsPerPage = options.pagesize;
			}

			var params = {
				start : 1,
				end : itemsPerPage,
				pagesize : itemsPerPage
			};
			
			if (options.params) {
				extraParams = options.params;
				params = $.extend({}, params, extraParams);
			}
			
			// server call
			refresh(params, defaultPage);
     		
 			// Bind click events
 			bindPaginationEvents();

     		return $datatable;
    	},
        
		// Show data grid if it is hidden
    	show : function() {
    		$(this).slideDown();
    	},
    	
    	// Reload the grid
    	reload : function() { 
			meta = $(this);

			//console.log('Reload Page: ' + $("#page-number").data("page"));
			var pageNo = $("#page-number").data("page");
			var startRow = 1;
			var endRow = itemsPerPage;
			if (pageNo) {
				startRow = (parseInt(pageNo) * itemsPerPage) + 1;
				endRow = (startRow + itemsPerPage) - 1;
			} else {
				pageNo = 0;
			}
			
			var params = { start: startRow, end: endRow, pagesize: itemsPerPage };
			if (extraParams) {
				params = $.extend({}, params, extraParams);
			}

			// server call
			refresh(params, parseInt(pageNo));

    	}
    };

	// Data Grid definition
    $.fn.datagrid = function(options) {
    	if ( methods[options] ) {
    		return methods[ options ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    	} else if ( typeof options === 'object' || ! options ) {
            // Default to "init"
    		return methods.init.apply( this, arguments );
    	} else {
    		$.error( 'Method ' +  method + ' does not exist on jQuery.datagrid' );
    	}    
    };

	function pagination(response) {
		
		// Get the total number of items
		var totalRows = response.totalRows;
		
		// Default - Items per page
		meta.data('itemsPerPage', itemsPerPage);
	
		// Calculate the number of pages needed
		numberOfPages = Math.ceil(totalRows/itemsPerPage);
	
		// Navigation order
		var navOrder = ["first", "prev", "num", "next", "last"];
		
		// Construct the nav bar
	    var first = '<td><a class="first" href="#"><img src="images/first.png"></a></td>';
	    var last = '<td><a class="last" href="#"><img src="images/last.png"></a></td>';
	    var prev = '<td><a class="prev" href="#" title="Previous"><img src="images/prev.png"></a></td>';
	    var next = '<td><a class="next" href="#" title="Next"><img src="images/next.png"></a></td>';
		
		var numPageLinksToDisplay = 20;
	
		var paginationHtml = "<div class='pagination'> <div class='paginationArea'>";
		paginationHtml += '<table><tr>';
	
		for(var i = 0; i < navOrder.length; i++) {
			switch (navOrder[i]) {
				case "first":
					paginationHtml += first;
					break;
				case "last":
					paginationHtml += last;
					break;
				case "next":
					paginationHtml += next;
					break;
				case "prev":
					paginationHtml += prev;
					break;
				case "num":
					paginationHtml += '<td>';
					paginationHtml += '<span>Page</span>';
					paginationHtml += '<input class="pageno" type="text" />';
					paginationHtml += '<span>of</span>';
					paginationHtml += '<span>'+ numberOfPages +'</span>';
					paginationHtml += '</td>';
					break;
				default:
					break;
			}
		}
		paginationHtml += "</tr></table>";
		paginationHtml += "</div></div>";
		
		return paginationHtml;
		
	}
	
	function showPrevPage(e){
		newPage = parseInt(meta.data('currentPage')) - 1;

		// Check that we aren't on a boundary link
		if(newPage >= 0) {
			gotopage(newPage);
		} 
	};

	function showNextPage(e){
		newPage = parseInt(meta.data('currentPage')) + 1;

		// Check that we aren't on a boundary link
		if(newPage < numberOfPages) {
			gotopage(newPage);
		}
	};

	function gotopage(pageNumber){

		// Set the current page meta data
		meta.data('currentPage', pageNumber);

		// Requesting page number from server
		var pageNo = parseInt(pageNumber);
		//console.log('Loading Page # ' + eval(pageNo + 1));
		
		var startRow = (pageNo * itemsPerPage) + 1;
		var endRow = (startRow + itemsPerPage) - 1;
		
		var params = { start: startRow, end: endRow, pagesize: itemsPerPage };
		if (extraParams) {
			params = $.extend({}, params, extraParams);
		}
		
		// server call
		refresh(params, pageNumber);
			
	};
	
	// Refresh the grid and pagination data using server call
	function refresh(params, currentPageNo) {
		$.getJSON(source, params,  function(json) {
			//console.log(json);
			var totalRows = json.totalRows;
			$datatable.html(
	     			_.template(template.html(), { data: json.rows, total: totalRows, show: params.show  }
	     	));
			
     		if (showPagination && totalRows > itemsPerPage) {

     			// Initialize meta data
     			meta.data('currentPage', currentPageNo);

     			$datatable.append(pagination(json));
     			
     			// Update the textbox
     			$(".pageno").val(eval(currentPageNo) + 1);
     		}
 			
     		// Set the current page for reload operation.
 			$("#page-number").data("page", currentPageNo);

		});
	}
	
	//Bind the actions to their respective links 
	function bindPaginationEvents() {

		// Event handler for 'First' link
		$('.first').live("click", function(e){
			e.preventDefault();
			var firstPage = 0;
			gotopage(firstPage);
		});

		// Event handler for 'Last' link
		$('.last').live("click", function(e){
			e.preventDefault();
			var lastPage = eval(numberOfPages)-1;
			gotopage(lastPage);
		});

		// Event handler for 'Prev' link
		$('.prev').live("click", function(e){
			e.preventDefault();
			showPrevPage($(this));
		});


		// Event handler for 'Next' link
		$('.next').live("click", function(e){
			e.preventDefault();
			showNextPage($(this));
		});

		// Event handler for text box
		$('.pageno').live("blur", function() {
			var pageNumber = $(this).val();
			if (!isNaN(pageNumber) && eval(pageNumber) > 0) {
				pageNumber = eval(pageNumber);
				if (pageNumber > numberOfPages) {
					pageNumber = eval(meta.data('currentPage')) + 1;
				}
			} else {
				pageNumber = eval(meta.data('currentPage')) + 1;
			}
			gotopage(eval(pageNumber-1));
		});

		// Goto the required page
		//gotopage(defaultPage);
		
	};

    
})( jQuery );