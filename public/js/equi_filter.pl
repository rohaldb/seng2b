#!/usr/bin/perl -w

while ($line = <>) {
  @to_print = ();
  @words = split " ", $line;
  foreach $word (@words) {
    # print "word = $word\n";
    @letters = split //, $word;
    $count_to_match = 0;
    $word_is_equi = 1;
    foreach $letter (@letters) {
      # print "letter = $letter\n";
      @matches = ($word =~ /$letter/gi);
      $letter_count = scalar(@matches);
      if ($count_to_match == 0) {$count_to_match = $letter_count;}
      elsif ($count_to_match != $letter_count) {
        $word_is_equi = 0;
        last;
      }
      # print "$letter matches $letter_count times\n";
    }
    if ($word_is_equi) {
      # print "$word is equi\n";
      push @to_print, $word;
    }
  }
  print "@to_print\n";
}
