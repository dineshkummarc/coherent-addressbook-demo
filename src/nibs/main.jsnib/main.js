/*jsl:import ../../js/core.js*/
/*jsl:import VCardController.js*/

NIB('main', {

  'main': VIEW({
            /* Put your view structure here. */
          
            ':root': coherent.View({
                    delegate: 'controller'
                    /* This is the container DOM element. */
                  }),

            '.entries .people ul': coherent.CollectionView({
                    contentBinding: 'vcards.arrangedObjects',
                    selectionIndexesBinding: 'vcards.selectionIndexes',
                    multiple: true,
                    viewTemplate: VIEW({
                        ':root': coherent.View({
                              textBinding: 'representedObject.fullName'
                            })
                      })
                  }),

            '.entries .groups ul': coherent.CollectionView({
                    //delegate: 'controller',
                    contentBinding: 'groups.arrangedObjects',
                    selectionIndexesBinding: 'groups.selectionIndexes',
                    allowsEmptySelection: true,
                    multiple: true,
                    viewTemplate: VIEW({
                        ':root': coherent.View({
                              textBinding: 'representedObject.string'
                            })
                      })
                  }),
                
            '.vcard img': coherent.Image({
                    srcBinding: {
                      keypath: 'vcards.selection.photo.url',
                      nullValuePlaceholder: NIB.asset('no-photo.png'),
                      noSelectionPlaceholder: NIB.asset('no-photo.png')
                    }
                  }),
            '.vcard h1': coherent.View({
                    textBinding: 'vcards.selection.fullName'
                  }),
            '.vcard h2': coherent.View({
                    textBinding: 'vcards.selection.title'
                  }),
            '.vcard h3': coherent.View({
                    textBinding: 'vcards.selection.department'
                  }),
            '.vcard h4': coherent.View({
                    textBinding: 'vcards.selection.organisation'
                  }),
            '.vcard ul.phone-numbers': coherent.CollectionView({
                    contentBinding: 'vcards.selection.phoneNumbers',
                    viewTemplate: VIEW({
                      ':root': coherent.View({
                            classBinding: {
                              keypath: 'representedObject.preferred',
                              transformedValue: function(value)
                              {
                                return value?'preferred':'';
                              }
                            }
                          }),
                      'em': coherent.View({
                            textBinding: 'representedObject.label'
                          }),
                      'a': coherent.Anchor({
                            textBinding: 'representedObject.number',
                            hrefBinding: 'representedObject.href'
                          })
                    })
                  }),
            '.vcard ul.email-addresses': coherent.CollectionView({
                    contentBinding: 'vcards.selection.emailAddresses',
                    viewTemplate: VIEW({
                      ':root': coherent.View({
                            classBinding: {
                              keypath: 'representedObject.preferred',
                              transformedValue: function(value)
                              {
                                return value?'preferred':'';
                              }
                            }
                          }),
                      'em': coherent.View({
                            textBinding: 'representedObject.label'
                          }),
                      'a': coherent.Anchor({
                            textBinding: 'representedObject.address',
                            hrefBinding: 'representedObject.href'
                          })
                    })
                  }),
            '.vcard ul.urls': coherent.CollectionView({
                    contentBinding: 'vcards.selection.urls',
                    viewTemplate: VIEW({
                      ':root': coherent.View({
                            classBinding: {
                              keypath: 'representedObject.preferred',
                              transformedValue: function(value)
                              {
                                return value?'preferred':'';
                              }
                            }
                          }),
                      'em': coherent.View({
                            textBinding: 'representedObject.label'
                          }),
                      'a': coherent.Anchor({
                            textBinding: 'representedObject.href',
                            hrefBinding: 'representedObject.href'
                          })
                    })
                  }),
            '.vcard ul.im-addresses': coherent.CollectionView({
                    contentBinding: 'vcards.selection.messengerAddresses',
                    viewTemplate: VIEW({
                      ':root': coherent.View({
                            classBinding: {
                              keypath: 'representedObject.preferred',
                              transformedValue: function(value)
                              {
                                return value?'preferred':'';
                              }
                            }
                          }),
                      'em': coherent.View({
                            textBinding: 'representedObject.label'
                          }),
                      'a': coherent.Anchor({
                            textBinding: 'representedObject.username',
                            hrefBinding: 'representedObject.href'
                          }),
                      'b': coherent.View({
                            textBinding: 'representedObject.network'
                          })
                    })
                  })
        }),

  'vcards': coherent.ArrayController({
          contentBinding: 'controller.content',
          sortDescriptorsBinding: 'controller.sortDescriptors',
          filterPredicateBinding: 'controller.peopleFilter'
        }),
        
  'groups': coherent.ArrayController({
          avoidsEmptySelection: false,
          contentBinding: 'controller.groups(StringToObject)'
        }),
        
  'controller': VCardController({
          view: 'main',
          selectedGroupsBinding: 'groups.selectedObjects.string'
        }),
        
  'owner': {
    view: 'main'
  }

});
