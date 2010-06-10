/*jsl:import ../../js/core.js*/

var VCardController= Class.create(coherent.ViewController, {

    exposedBindings: ['selectedGroups'],
    
    awakeFromNib: function()
    {
        var view= this.view();
        if (!view)
            return;
        
        // var entries= view.viewWithSelector('.entries .people ul');
        // entries.registerForDraggedTypes('text/x-vcard', 'text/directory');
        view.registerForDraggedTypes('text/x-vcard', 'text/directory');

        var sortDescriptor= new coherent.SortDescriptor('fullName', true);
        this.setValueForKey([sortDescriptor], 'sortDescriptors');
        
        if (this.sampleCard)
            this.setValueForKey(VCard.parse(this.sampleCard), 'content');
            
        window.vcardController= this;
    },

    updatePeopleFilter: function()
    {
        function filter(vcard)
        {
            var groups= filter.groups;
            var len= groups.length;
            
            if (!len)
                return true;
                
            while (len--)
                if (-1!==vcard.categories.indexOf(groups[len]))
                    return true;
            return false;
        }
        filter.groups= this.__selectedGroups;
        
        this.setValueForKey(filter, 'peopleFilter');
    },
    
    selectedGroups: function()
    {
        return this.__selectedGroups;
    },
    
    setSelectedGroups: function(newGroups)
    {
        this.__selectedGroups= newGroups ? newGroups.copy() : [];
        this.updatePeopleFilter();
    },
    
    draggingEntered: function(dragInfo)
    {
        return "copy";
    },

    prepareForDragOperation: function(dragInfo)
    {
        return true;
    },
    
    /** Return true if the view was able to perform the drag. */
    performDragOperation: function(dragInfo)
    {
        var cards= VCard.parse(dragInfo.getData('text/directory'));
        this.setValueForKey(cards, 'content');
        
        var groups= this.valueForKeyPath('content.@distinctUnionOfArrays.categories');
        this.setValueForKey(groups, 'groups');
        
        return true;
    },
    
    concludeDragOperation: function(dragInfo)
    {
    }
    
});