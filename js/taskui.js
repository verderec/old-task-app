$( document ).on( "mobileinit", function () {
  
  var app = taskApp(),
      taskList = app.getAll()[0] || app.add(),

			/**
			 *  display a task
			 */
      displayTask = function displayTask (task) {
        $('#tasks-list').append(
          [
            '<li data-icon="carat-r" id="', task.id, '">',
            '<a href="#">',
            '<h2>', task.name, '</h2>',
            '<p>', task.details, '</p>',
            '</a>',
            '<a href="#">',
            'Show',
            '</a>',
            '</li>'
          ].join('')
        );
        $('#tasks-list').listview('refresh');
      },

      displayTaskList = function displayTaskList (taskList) {
        $('#lists-list').append(
          [
            '<li id="', taskList.getId(), '">',
            '<a href="#">',
            '<h2>', taskList.getName(), '</h2>',
            '<p>', taskList.getDescription(), '</p>',
            '<span class="ui-li-count">',
            taskList.getAll().length,
            '</span>',
            '</a>',
            '</li>'
          ].join('')
        );
        $('#lists-list').listview('refresh');
      },
      
      deleteTaskList = function deleteTaskList (event) {
        var taskListItem = event.data,
            taskListId = taskListItem.attr("id");

        event.preventDefault();
        
        if (app.remove(taskListId)) {
          taskListItem.remove();
          $('#lists-list').listview('refresh');
        }
      },

		  /**
			 *  Handle the task list submit button
			 *  Add a new tasklist to the list, display it,
			 *  and clear the form fields
			 */
			createTaskList = function createTaskList (event) {
		    var list = {}, taskList;

        event.preventDefault();

        list.name = $('#list-name').val().trim();
        list.description = $('#list-desc').val().trim();
        
        $( "#add-list" ).popup("close");
        if (list.name === '') {
          setTimeout(function () {
            $('#no-task-list-name').popup('open');
          }, 100);
        } else {
          taskList = app.add(list);
  		    $( '#list-name' ).val('');
  		    $( '#list-desc' ).val('');
          displayTaskList(taskList);
          $('#lists-list').listview("refresh");
        }
			},
			
			/**
			 * remove a task from the list, and remove it from
			 * the display
       */
      deleteTask = function deleteTask (event) {
				var taskItem = event.data,
            taskId = taskItem.attr("id");
        
        event.preventDefault();

        if (taskList.remove(taskId)) {
          taskItem.remove();
          $('#tasks-list').listview('refresh');
        }
      },
			
		  /**
			 *  Handle the task submit button
			 *  Add a new task to the list, display it,
			 *  and clear the form fields
			 */
			createTask = function createTask (event) {
		    var item = {}, taskId, task;

        event.preventDefault();

        item.name = $('#task-name').val().trim();
				item.details = $('#task-details').val().trim();

        $( "#add-task" ).popup("close");
        if (item.name === '') {
          setTimeout(function () {
            $('#no-task-name').popup('open');
          }, 100);
        } else {
          taskId = taskList.add(item);
          task = taskList.get(taskId);
  		    $( '#task-name' ).val('');
  		    $( '#task-details' ).val('');
          displayTask(task);
          $('#tasks-list').listview("refresh");
        }
			},
			
      setupSwipes = function setupSwipes (listElement, deleteFn) {
        var
          /**
    			 *  setup the delete event handler after
    			 *  a left swipe on a task or taskList
    			 *
    			 *  if there's an existing item awaiting
    			 *  deletion, clear the delete button on
    			 *  that item frst.
    			 *
    			 *  TODO: that could probably be done with
    			 *        selectors rather than a variable
    			 */
    			setupDelete = function setupDelete (target, deleteFn) {
    				var icon = target.children().last();
				
    				// clear existing delete button
            $(listElement).children("[data-icon='delete']").each(function (idx, el) {
              clearDelete(el);
            })

    				// change the icon from > to X, use style C for red
    				// background
    				$(icon).attr('data-icon', 'delete')
    		                     .addClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
    		                     .removeClass('ui-icon-carat-r');

    				// register deleteTask as the click handler,
    				// and pass in the LI element in event.data
    				$(icon).on('click', null, target, deleteFn);

    			},
			
    			/**
    			 *  Clear the delete button from a target,
    			 *  and remove deleteTask from the click handler
    			 */
    			clearDelete = function clearDelete (target) {
    				var icon = target.children().last();

  					$(icon).attr('data-icon', 'carat-r')
  			                     .removeClass('ui-nodisc-icon ui-icon-delete ui-btn-c')
  			                     .addClass('ui-icon-carat-r');

  					$(icon).off('click', deleteTask);
    			};
      
      	// use left swipe to show the delete button on a task
      	$(listElement).on("swipeleft", function (event) {
      		// find the LI element that enclose the element
      		// that received the swipe event
      		var target = $(event.target).parentsUntil('', 'li');
      		// set up the delete handler
      		if (target && target.length === 1) {
      			setupDelete(target, deleteFn);
      			$(listElement).listview('refresh');
      		}
      	});

      	// use right swipe to hide the delete button on a task
      	$(listElement).on("swiperight", function (event) {
      		// find the LI element that enclose the element
      		// that received the swipe event
      		var target = $(event.target).parentsUntil('', 'li');
      		// set up the delete handler
      		if (target && target.length === 1) {
      			clearDelete(target);
      			$(listElement).listview('refresh');
      		}
      	});
      };


	// suppress Enter/Return in forms
//  $("form :input").on("keypress", function(e) {
//      return e.keyCode != 13;
//  });

	// display any existing tasks (loaded from localstorage)
//  tasks.forEach(displayTask);

  $( document ).on("pagecreate", "#tasks-page", function () {
    setupSwipes($('#tasks-list'), deleteTask);
    // register the event handler for creating tasks
    $("#add-task-add").on("click", createTask);
  });

  $( document ).on("pagebeforeshow", "#tasks-page", function (event) {
    $('#tasks-list').empty();
    taskList.forEach(function (task) {
      displayTask(task)
    });
    $('#tasks-list').listview('refresh');
    
  });

  $( document ).on("pagebeforehide", "#tasks-page", function (event) {
    // update lists-page coount
    var selector = '#' + taskList.getId() + ' .ui-li-count';
    $(selector).html(taskList.getAll().length);
  });
  
  $( document ).on("pagecreate", '#lists-page', function() {
    app.forEach(displayTaskList);
    $('#lists-list').listview('refresh');
    setupSwipes($('#lists-list'), deleteTaskList);
    $("#add-list-add").on("click", createTaskList);
    $("#lists-list").on("click", function (event) {
  		var target = $(event.target).parentsUntil('', 'li'),
          taskListId;

      event.preventDefault();
      if (target && target.length > 0) {
        taskListId = target.attr('id');
        taskList = app.get(taskListId);
        $('#tasks-page header h1').html(taskList.getName());
        $( ":mobile-pagecontainer" ).pagecontainer( "change", $('#tasks-page'));
      }
    });
  });
});
