// ==UserScript==
// @name          Dropbox Forum Extender
// @namespace     IdeativeSoftware.Dropbox
// @description   Extends Dropbox Forums with quoting
// @include       https://forums.dropbox.com/*
// @require       //ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js
// @grant		  none
// ==/UserScript==

// User Settings
var Signature = "Set your custom signature here - use \n for new lines";

// Version 2011.1 - 2011-02-16
// Version 2011.3 - 2011-02-16
// Version 2011.4 - 2011-10-20
// Version 2012.1 - 2012-08-26
var InternalVersion = "2012.2";

// Parameters
var PostTextAreaName = "post_content";
var TopicPageRecordLimit = 30;

/************************************************/
/**				FORUM POST HANDLERS            **/
/************************************************/

AddPrerequisites();
AddPostForm();
AddVersion();
//AddBreadcrumb();

function AddPostForm() {
	// Append the posting form if necessary
	if($('form#postform:first').length == 0) {
		var PostFormPageUrl = $('h2.post-form a:first').attr('href');
		var PostFormPageData = $.get(PostFormPageUrl, function(data) {
			$('div#main').append($(data).find('form#postform:first'));
			$('h2.post-form a:first').remove();
			AddMarkupLinks();
		}, "html");
	} else {
		AddMarkupLinks();
	}
}

function AddVersion() {
	// Add the version number
	$('div#footer').append('<div style="text-align: right; color: rgb(102, 102, 102); font-size: 11px; clear: both;">Dropbox Forum Extender Version ' + InternalVersion + '</div>');
}

function AddMarkupLinks() {
	// Add the quote links to the posts
	$('.poststuff').append(' - <a href="javascript:void(0)" class="gsDropboxExtenderQuoteSelected">quote selected</a> - <a href="javascript:void(0)" class="gsDropboxExtenderQuotePost">quote post</a>');
	$('p.submit').append('<span style="float: left;"> - <a href="javascript:void(0)" class="gsDropboxExtenderAnchorSelected">a</a> - <a href="javascript:void(0)" class="gsDropboxExtenderBoldSelected">bold</a> - <a href="javascript:void(0)" class="gsDropboxExtenderItalicSelected">italic</a> - <a href="javascript:void(0)" class="gsDropboxExtenderCodeSelected">code</a> - <a href="javascript:void(0)" class="gsDropboxExtenderOrderedListInsert">ordered list</a> - <a href="javascript:void(0)" class="gsDropboxExtenderUnorderedListInsert">unordered list</a> - <a href="javascript:void(0)" class="gsDropboxExtenderSignatureInsert">custom signature</a></span>');
}

function AddBreadcrumb() {
	// Deprecated (2012-08-26) - no further requirement
	// Clone the breadcrumb and append it at the bottom of the post list for easy navigation
	var BreadCrumb = $('div.bbcrumb').clone();
	$('div.nav').append($(BreadCrumb));
}

function AddPrerequisites() {
	$("head").append("<style type=\"text/css\" charset=\"utf-8\">#gsDropboxExtender-anchor-popup {	display:none;	position:fixed;	_position:absolute;	 /* hack for internet explorer 6*/height:200px;	width:408px;	background:#FFFFFF;	border:2px solid #cecece;	z-index:2;	padding:12px;	font-size:13px;}#gsDropboxExtender-listbox-popup {	display:none;	position:fixed;	_position:absolute;	 /* hack for internet explorer 6*/height:200px;	width:408px;	background:#FFFFFF;	border:2px solid #cecece;	z-index:2;	padding:12px;	font-size:13px;}#gsDropboxExtender-anchor-popup h1, #gsDropboxExtender-listbox-popup h1 {	text-align:left;	color:#6FA5FD;	font-size:22px;	font-weight:700;	border-bottom:1px dotted #D3D3D3;	padding-bottom:2px;	margin-bottom:20px;} .gsDropboxExtenderPopupClose:hover { 	cursor: pointer;} .gsDropboxExtenderPopupClose {	font-size:14px;	line-height:14px;	right:6px;	top:4px;	position:absolute;	color:#6fa5fd;	font-weight:700;	display:block;}#gsDropboxExtender-listbox-unordered, #gsDropboxExtender-listbox-ordered {	margin-left: 20px;}</style>");
	$('body').append('<div id="gsDropboxExtender-anchor-popup"><a id="gsDropboxExtenderAnchorClose" class="gsDropboxExtenderPopupClose">x</a><h1>Add Link</h1><br /><br /><div><div style="clear: both; height: 20px;"><label style="float: left;">Title: </label><input id="gsDropboxExtenderAnchorTextBox" class="textinput" type="text" maxlength="500" size="100" style="height: 16px; float: right; width: 300px;" /></div><div style="clear: both; height: 20px;"><label style="float: left;">Url: </label><input id="gsDropboxExtenderAnchorUrlBox" class="textinput" type="text" maxlength="500" size="100" style="height: 16px; float: right; width: 300px;" /></div><br /><input type="submit" tabindex="4" value="Add Link" class="button" name="Submit" id="gsDropboxExtenderAnchorAddLink" style="clear: both; float: right;"></div>');
	$('body').append('<div id="gsDropboxExtender-screen-overlay" style="display:none; position:fixed; height:100%; width:100%;  top:0;   left:0;  background:#000000;  border:1px solid #cecece;  z-index:1; opacity: 0.7;"> </div>'); 
	$('body').append('<div id="gsDropboxExtender-listbox-popup"><a id="gsDropboxExtenderListBoxClose" class="gsDropboxExtenderPopupClose">x</a><h1>Add List</h1><div><ul id="gsDropboxExtender-listbox-unordered"></ul><ol id="gsDropboxExtender-listbox-ordered"></ol><br /></div><div><div style="clear: both; height: 20px;"><label style="float: left;">Item: </label><input id="gsDropboxExtenderListBoxTextBox" class="textinput" type="text" maxlength="500" size="100" style="height: 16px; float: right; width: 300px;" /></div><br /><input type="submit" tabindex="4" value="Add Item" class="button" name="Submit" id="gsDropboxExtenderListBoxAddItem" style="clear: both; float: right;"><br /><br /><input type="submit" tabindex="4" value="Ok" class="button" name="Submit" id="gsDropboxExtenderListBoxOk" style="clear: both; float: right;"></div>');
}


// Quote the current post
jQuery('.gsDropboxExtenderQuotePost').live('click', function(evt) {
	var SelectedText = $(evt.target).parent().parent().find(".post").eq(0).text();
	SelectedText = SelectedText.substring(0, SelectedText.length-1);
	InsertSelectedQuote(SelectedText, GetPostAuthorDetails(evt.target));
});


// Quote the selected text on the page
jQuery('.gsDropboxExtenderQuoteSelected').live('click', function(evt) {
	InsertSelectedQuote(GetSelectedText(), GetPostAuthorDetails(evt.target));
});

// Bold the current text
jQuery('.gsDropboxExtenderBoldSelected').live('click', function(evt) {
	InsertAndMarkupTextAtCursorPosition("strong");
});

// Italic the current text
jQuery('.gsDropboxExtenderItalicSelected').live('click', function(evt) {
	InsertAndMarkupTextAtCursorPosition("em");
});

// Code the current text
jQuery('.gsDropboxExtenderCodeSelected').live('click', function(evt) {
	InsertAndMarkupTextAtCursorPosition("code");
});

// Insert a list
var ListType = "";

jQuery('.gsDropboxExtenderUnorderedListInsert').live('click', function(evt) {
	ShowListBoxPopUp("UNORDERED");
});

jQuery('.gsDropboxExtenderOrderedListInsert').live('click', function(evt) {
	ShowListBoxPopUp("ORDERED");
});

jQuery('#gsDropboxExtenderListBoxClose').live('click',function(){  
	HideListBoxPopUp(); 
}); 

jQuery('#gsDropboxExtenderListBoxAddItem').live('click',function(){ 
	if($('#gsDropboxExtenderListBoxTextBox').val().length == 0) {
		return;
	}

	if (ListType == "UNORDERED")
	{
		$('#gsDropboxExtender-listbox-unordered').append("<li>" + $('#gsDropboxExtenderListBoxTextBox').val() + "</li>");
	}
	if (ListType == "ORDERED")
	{
		$('#gsDropboxExtender-listbox-ordered').append("<li>" + $('#gsDropboxExtenderListBoxTextBox').val() + "</li>");
	}

	// Empty the text box
	$('#gsDropboxExtenderListBoxTextBox').val("");

	// Increase the popups size
	$("#gsDropboxExtender-listbox-popup").height($("#gsDropboxExtender-listbox-popup").height() + 20);
}); 

// Insert an ordered list
jQuery('#gsDropboxExtenderListBoxOk').live('click', function(evt) {

	var Contents = "";
	var CursorStartPosition = $('#' + PostTextAreaName)[0].selectionStart;

	if (ListType == "UNORDERED")
	{
		//alert($('ul#gsDropboxExtender-listbox-unordered').get());
		Contents = $('ul#gsDropboxExtender-listbox-unordered').get();
		InsertTextAtCursorPosition("<ul>\n" + $(Contents).html() + "\n</ul>");
		SetCursorPositionInTextArea(PostTextAreaName, CursorStartPosition + $(Contents).html().length + 11 );
	}
	if (ListType == "ORDERED")
	{
		//alert($('ol#gsDropboxExtender-listbox-ordered').get());
		Contents = $('ol#gsDropboxExtender-listbox-ordered').get();
		InsertTextAtCursorPosition("<ol>\n" + $(Contents).html() + "\n</ol>");
		SetCursorPositionInTextArea(PostTextAreaName, CursorStartPosition + $(Contents).html().length + 11 );
	}

	HideListBoxPopUp(); 

});

// Insert an anchor
jQuery('.gsDropboxExtenderAnchorSelected').live('click', function(evt) {
	ShowAnchorPopUp();
});

jQuery('#gsDropboxExtenderAnchorClose').live('click',function(){
	HideAnchorPopUp(); 
});  

jQuery('#gsDropboxExtenderAnchorAddLink').live('click',function(){
	HideAnchorPopUp();
	
	InsertTextAtCursorPosition("<a href='" + $('#gsDropboxExtenderAnchorUrlBox').val() + "'>" + $('#gsDropboxExtenderAnchorTextBox').val() + "</a>");
});

 // Add the user aignature
jQuery('.gsDropboxExtenderSignatureInsert').live('click', function(evt) {
	SetCursorPositionInTextArea(PostTextAreaName, $('#' + PostTextAreaName).val().length);
	InsertTextAtCursorPosition("\n\n--\n" + Signature);
});

/************************************************/
/**				POPUP WINDOWS                  **/
/************************************************/

function ShowListBoxPopUp(_ListType) {

	ListType = _ListType;

	$('ol#gsDropboxExtender-listbox-ordered').empty();
	$('ol#gsDropboxExtender-listbox-unordered').empty();
	$('#gsDropboxExtenderListBoxTextBox').val("");

	var windowWidth = document.documentElement.clientWidth;  
	var windowHeight = document.documentElement.clientHeight;  
	var popupHeight = $("#gsDropboxExtender-listbox-popup").height();  
	var popupWidth = $("#gsDropboxExtender-listbox-popup").width();  

	$("#gsDropboxExtender-listbox-popup").css({  
		"position": "fixed",  
		"top": windowHeight/2-popupHeight/2,  
		"left": windowWidth/2-popupWidth/2  
	});  

	$("#gsDropboxExtender-screen-overlay").show();  
	$("#gsDropboxExtender-listbox-popup").show();  
}

function HideListBoxPopUp() {
	$("#gsDropboxExtender-screen-overlay").hide();  
	$("#gsDropboxExtender-listbox-popup").hide(); 
}

function ShowAnchorPopUp() {
	var windowWidth = document.documentElement.clientWidth;  
	var windowHeight = document.documentElement.clientHeight;  
	var popupHeight = $("#gsDropboxExtender-anchor-popup").height();  
	var popupWidth = $("#gsDropboxExtender-anchor-popup").width();  

	$("#gsDropboxExtender-anchor-popup").css({  
		"position": "fixed",  
		"top": windowHeight/2-popupHeight/2,  
		"left": windowWidth/2-popupWidth/2  
	});  

	$("#gsDropboxExtender-screen-overlay").show();  
	$("#gsDropboxExtender-anchor-popup").show();
}

function HideAnchorPopUp() {
	$("#gsDropboxExtender-screen-overlay").hide();  
	$("#gsDropboxExtender-anchor-popup").hide(); 
}

/************************************************/
/**				FORUM TOPIC INDEXES            **/
/************************************************/

// Add link to last page on each topic post count
$('table#latest').each(function(evt) {
	// Handle each row
	$(this).find('tr').each(function(evt) {
		var PostCountCell = $(this).find('td').eq(1);
		var PostUrl = $(this).find('td').eq(0).find('a').eq(0).attr('href');
		
		if ($(PostCountCell).html() != null)
		{
			var PostCount = $(PostCountCell).text();

			if (PostCount/TopicPageRecordLimit > 1)
			{
				var PageNumber = Math.ceil(PostCount/TopicPageRecordLimit);
				$(PostCountCell).html("<a href='" + PostUrl + "&page=" + PageNumber + "#latest'>" + $(PostCountCell).text() + "</a>");
			} else {
				$(PostCountCell).html("<a href='" + PostUrl + "#latest'>" + $(PostCountCell).text() + "</a>");
			}
		}
		
	});
});



// Take us to the last topic on the page
var PageLocation = window.location.href;
if (PageLocation.indexOf("#latest") != -1)
{
	$('html,body').animate({scrollTop: $('#'+$("ol#thread li:last").attr("id")).offset().top}, 50)
}

/************************************************/
/**				PROFILE INDEXES                **/
/************************************************/

$('div#user-replies ol li').each(function(evt) {
	// Handle each row
	$(this).find('a').each(function(evt) {
		var PostUrl = $(this).attr('href');
		var PostCount = PostUrl.split("=")[2];
		var FreshnessSpan = $(this).parent().find('.freshness').eq(0);

		var PageNumber = Math.ceil(PostCount/TopicPageRecordLimit);

		if (PageNumber > 1)
		{
			$(FreshnessSpan).html("<a href='" + PostUrl + "&page=" + PageNumber + "#latest'>" + $(FreshnessSpan).text() + "</a>");
		} else {
			$(FreshnessSpan).html("<a href='" + PostUrl + "#latest'>" + $(FreshnessSpan).text() + "</a>");
		}

	});
});

$('div#user-threads ol li').each(function(evt) {
	// Handle each row
	$(this).find('a').each(function(evt) {
		var PostUrl = $(this).attr('href');
		var PostCount = PostUrl.split("=")[2];
		var FreshnessSpan = $(this).parent().find('.freshness').eq(0);

		var PageNumber = Math.ceil(PostCount/TopicPageRecordLimit);

		if (PageNumber > 1)
		{
			$(FreshnessSpan).html("<a href='" + PostUrl + "&page=" + PageNumber + "#latest'>" + $(FreshnessSpan).text() + "</a>");
		} else {
			$(FreshnessSpan).html("<a href='" + PostUrl + "#latest'>" + $(FreshnessSpan).text() + "</a>");
		}

	});
});
/************************************************/
/**				GENERIC FUNCTIONS              **/
/************************************************/


// Get post author markup
function GetPostAuthorDetails(PostEventTarget) {
	var SelectedAuthor = $(PostEventTarget).parent().parent().parent().find(".threadauthor").eq(0).find('strong').eq(0).clone();

	return "<strong>" + $(SelectedAuthor).html().replace("<img align=\"top\" src=\"/bb-templates/dropbox/images/star.gif\">", "") + "</strong> scribbled:<br /><br />";
}

// Insert some markup at the required position
function InsertAndMarkupTextAtCursorPosition(Wrapper) {
	var SelectedTextStart = $('#' + PostTextAreaName)[0].selectionStart;
	var SelectedTextEnd = $('#' + PostTextAreaName)[0].selectionEnd;
	var EndCursorPosition = SelectedTextStart;

	var SelectedText = '';

	if (SelectedTextEnd - SelectedTextStart > 0)
	{
		SelectedText = $('#' + PostTextAreaName).val().substring(SelectedTextStart, SelectedTextEnd);

	}

	if (Wrapper == "code")
	{
		var ReplacementText = "<code>" + SelectedText + "</code>";
		EndCursorPosition += 6;
	} else if (Wrapper == "strong")
	{
		var ReplacementText = "<strong>" + SelectedText + "</strong>";
		EndCursorPosition += 8;
	} else if (Wrapper == "em")
	{
		var ReplacementText = "<em>" + SelectedText + "</em>";
		EndCursorPosition += 4;
	}

	InsertTextAtCursorPosition(ReplacementText);

	if (SelectedText == '')
	{
		SetCursorPositionInTextArea(PostTextAreaName, EndCursorPosition);
	}
	
}

// Insert some text at the required position
function InsertTextAtCursorPosition(TextToBeInserted)
{
	var SelectedTextStart = $('#' + PostTextAreaName)[0].selectionStart;
	var SelectedTextEnd = $('#' + PostTextAreaName)[0].selectionEnd;

	$('#' + PostTextAreaName).val(
		$('#' + PostTextAreaName).val().substring(0, SelectedTextStart) + TextToBeInserted + $('#' + PostTextAreaName).val().substring(SelectedTextEnd)
	); 
}

// Move the cursor position to set character in text area
function SetCursorPositionInTextArea(Id, Pos) {
    var Element = document.getElementById(Id);

    if(Element != null) {
        if(Element.createTextRange) {
            var range = Element.createTextRange();
            range.move('character', Pos);
            range.select();
        }
        else {
			Element.focus();
            if(Element.selectionStart) {
                Element.setSelectionRange(Pos, Pos);
            }
        }
    }
}

// Function for inserting quote
function InsertSelectedQuote(TextToQuote, PostAuthorDetails) {
	if (TextToQuote != '')
	{
		if (PostAuthorDetails == undefined) {
			PostAuthorDetails = '';
		}

		var SelectionStart = $('#' + PostTextAreaName)[0].selectionStart;
		var NewlineNeeded = (SelectionStart>0) && ($('#' + PostTextAreaName).val().charAt(SelectionStart-1)!="\n");
		var AppendedText = (NewlineNeeded ? "\n" : "") + "<blockquote>" + PostAuthorDetails + TextToQuote + "</blockquote>\n";
		var EndCursorPosition = SelectionStart + AppendedText.length;

		InsertTextAtCursorPosition(AppendedText);
		SetCursorPositionInTextArea(PostTextAreaName, EndCursorPosition);
	}
}

// Function for getting the selected text for quoting
function GetSelectedText() {
    if (window.getSelection) {
        return SelectedText = window.getSelection();
    }
    else if (document.selection) {
        return SelectedText = document.selection.createRange().text;
    }
}
