---
title: "Creating a Repeatable Address Form with HTML::FormHandler"
publishDate: "23 August 2013"
description: "Creating a Repeatable Address Form with HTML::FormHandler"
slug: multiple-forms-with-html-form-handler
tags: [ "perl", "cpan", "forms", "HTML::FormHandler", "dancer"]
draft: false
---

## Creating a Repeatable Address Form with HTML::FormHandler

This is a summary of how I created a repeatable Address Form Module, [Mover::Form::Travel::Matrix](https://github.com/aibistin/Mover-Form-Travel-Matrix "Mover::Form::Travel::Matrix"), using the Perl Cpan module HTML::FormHandler.

As part of my [TravelTime Application](https://github.com/aibistin/TravelTime "Travel Time Application") project I needed to create a form to enter multiple location addresses. I could construct the form manually using Template Toolkit, but I would still need to write my own validation and JavaScript to implement the multiple form requirement.  
I could have used HTML::FormFU I have used this previously to build more complex forms. Not that HTML::FormFu isn’t useful. Once it is mastered it can be a great tool for building many types of complex forms. For me, I found that the learning curve was much too steep and the documentation was dispersed widely amongst many modules. I am sure that this has been improved in recent times, but I really don’t want to go back to pouring through reams of docs for this project.  
I had wanted an excuse to experiment with [HTML::Formhandler](https://metacpan.org/module/HTML::FormHandler "FormHandler") and this seemed like a good time to do this. The documentation for this makes War And Peace seem like a side note on a shopping list. It must have taken longer to create than the Bible and hopefully will be less contentious.  
What I like about HTML::FormHandler is that it seems much more Moose Like and intuitive to anybody who has worked with Moose. It seems very simple at first, however to get the best out of this, the learning curve is steep and requires time. So, say goodbye to family and social life while you get familiar with HTML::FormHandler.

## FormHandler Forms

### Mover::Form::Field::Address

Before I make my repeatable address form, I created a form element for any US address using a FormHandler Moose Role. This is one of the many useful things about HTML::Formhandler. You can create many building blocks which can be used again and again. Here is the module on github [Mover::Form::Field::Address](https://github.com/aibistin/Mover-Form-Field-Address "Mover::Form::Field::Address")  

```perl title="HTML::FormHandler::Types"
use HTML::FormHandler::Types qw/Zip Trim Collapse/;

has_field 'address_1' => (
    is      => 'rw',
    isa     => Collapse,
    required => 0,
    message  => {
        required => 'You must enter a street address!'
    }
);
has_field 'address_2' => (is => 'rw', isa => Collapse);
has_field 'city' => (is => 'rw', isa => Collapse);
has_field 'state' => ( type => 'Select', options_method => \\&_options_state );
has_field 'country' => (is => 'rw', isa => Collapse);

# ------ Create Zip Field Type

has_field 'zip' => ( is => 'rw',  isa => Zip);

=head2 options_state
  Builds the Options for US states. (NY New York,  AL Alabama etc).
  Note: It does not include "DC". I may add DC later just as an alternative.
=cut

sub _options_state {

    return (
        'AL' => 'Alabama',
        'AK' => 'Alaska',
        'AZ' => 'Arizona',
         ...
        'WY' => 'Wyoming',
    );

}

no HTML::FormHandler::Moose::Role;
1;
```

When I initially created this Role, I had intended to manually validate the Zip Code field using Regexp::Common. I then found that FormHandler has a [types Module](https://metacpan.org/module/GSHANK/HTML-FormHandler-0.40025/lib/HTML/FormHandler/Types.pm "FormHandler Types") with some useful stuff in there, including a zip code. I will try this out instead. It also has types to trim off extra white space. How convenient.

### Mover::Form::Travel::Matrix

This is the actual HTML::FormHandler form, which has repeatable Address elements. I also opted to include some of the convenient FormHandler Widgets that were created to make use of the Twitter Bootstrap CSS framework. There’s lots of stuff available with HTML::FormHandler.  
This module is available here on GitHub [Mover::Form::Travel::Matrix](https://github.com/aibistin/Mover-Form-Travel-Matrix "Mover::Form::Travel::Matrix")  

```perl title="Mover::Form::Field"
has '+field_name_space' => ( default => 'Mover::Form::Field' );
has '+name'        => ( default => $form_name );
has '+html_prefix' => ( default => 1 );
has '+is_html5'    => ( default => 1 );
has '+http_method' => ( default => $http_method );
has '+action'      => ( default => $form_action );

# ----- Mover::Form::Field::Address that is Repeatable
has_field 'addresses' => (
    type         => 'Repeatable',
    setup_for_js => 1,
    do_wrapper   => 1,
    tags         => { controls_div => 1 },
    auto_id      => 1,
);

has_field 'addresses.contains' => ( type => 'Address', );

has_field 'submit' => (
    type         => 'Submit',
    widget       => 'ButtonTag',
    element_attr => { class => [ 'btn', $button_class, $button_size ] },
    do_wrapper   => 0,
    value        => 'Get Travel Time'
);
has '+info_message'    => ( default => 'Starting point.' );
has '+success_message' => ( default => 'Form successfully submitted' );
has '+error_message'   => ( default => 'Please fix the errors on this form!' );
```

Now, we have a form with a repeatable address field and some fancy Bootstrap CSS, Yippee!  
Next up is to create some templates to render the form pages. So, I will use the now familiar Template Toolkit to do this.

### The Address Form Template::Toolkit Template

```html title="travel_time.tt"
<!-- Travel Matrix Form -->
<form name="[% tm_form.name %]" id="[% tm_form.name %]"
  action="[% tm_form.action %]" method="[% tm_form.http_method %]"
  class="form-vertical" >

<fieldset >
   <legend>
      <p class="lead">
         [%-
             travel_time_heading
             || 'Calculate Moving Truck Travel Time'
         -%]
      </p>
   </legend>

<!--  Start messages -->
    <div id="messages">
    <p class="text-success">[%- success_message -%]</p>
    <p class="text-error">[%- error_message -%]</p>
    <p class="text-warning">[%- warning_message -%]</p>
    <p class="text-info">[%- info_message  -%]</p>
    </div>
<!-- End  messages -->

    [% started_new_row  = 0  %]  [%# To specify how many Addresses per line %]
    <!--- four to a line -->
    [% FOREACH address_element IN tm_form.field('addresses').fields -%]
        [%  IF ((loop.count == 1) || ((loop.count % 5) == 0))   %]

          [% IF ( started_new_row == 1) %]
              <!-- Close previous row before opening a new one. -->
               </div> <!-- /row-fluid -->
          [%  END %]
          <div class="row-fluid">
          [% started_new_row  = 1 %]
        [% END %]

        <div class="span3 well">
        
          [% IF loop.first %]
              <span class="text-info">
                <abbr title='Calculations are based from a starting point in central New York City.'>
                First Address
                </abbr>
              </span>
          [% ELSIF loop.last  %] 
              <span class="text-info">
                  <abbr title='The next version will have an option for more destination points.'>
                  Last Address</abbr>
              </span>

          [% ELSE %]
              <span class='text-info'>Address [% loop.count %]</span>
          [% END %]
          
          [% address_element.render %]

        </div> <!-- /span3 -->
    [% END %]

    [% IF ( started_new_row == 1) %] [%# Close div tag at end of each row %]
        </div> <!-- /row-fluid -->
        [% started_new_row  = 0 %]
    [%  END %]

<div class="row-fluid">
    [% tm_form.field('submit').render %]
</div> <!-- /row-fluid -->
</fieldset>
</form>

</div> <!-- /row-fluid -->

[% IF ( tm_form.is_valid) %]

    [% IF (my_errors) %]
        <div class="alert alert-error">
        <span><b>[% error_message  || 'What a mess!' %]</b></span>
        [%# One way to loop through a hash %]
        [% FOREACH error IN my_errors.values %]
         <span> [% error %]</span>
         [% END %]
        </div>
    [%  END %]

[% ELSIF ( tm_form.errors) %]
    <div class="alert alert-error row-fluid">
        [% FOREACH error IN tm_form.errors -%]
        <span class="span2">[% error %]</span>
        [% END %]
    </div>
[%  END %]
```

The source code for this template is available [here](https://github.com/aibistin/TravelTime/blob/master/views/travel_time.tt "travel_time.tt").  
There are many other ways to render a [HTML::Formhandler](https://metacpan.org/module/HTML::FormHandler "FormHandler") form, which you can explore in the [CPAN documentation](https://metacpan.org/module/GSHANK/HTML-FormHandler-0.40027/lib/HTML/FormHandler/Manual.pod "HTML::FromHandler Docs").

There is much to explore in HTML::FormHandler and I am sure I will be using it again in future projects.

#### Links

- [Perl](http://www.perl.org)
- [HTML::FormHandler](https://metacpan.org/pod/HTML::FormHandler)
- [Template Toolkit](https://metacpan.org/pod/Template::Toolkit)
- [Bootstrap](https://getbootstrap.com/1.0.0/)
- [Me on Linkedin](https://www.linkedin.com/in/austin-kenny-87515311/)  
- [GitHub Repo](https://github.com/aibistin/Mover-Form-Travel-Matrix)
