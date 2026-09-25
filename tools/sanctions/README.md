# Sanctions list checker

Loads the UK, US and UN public sanctions lists into one table, then checks a
name against all three at once. Run it: `python -m sanctions.check "Company Name"`.

It gives back **candidate matches**, never a verdict: a name that looks
similar to something on a public list, with which list, which program, the
listing date, and the exact source file and row so a person can go check it
by hand.

Names are cleaned up before comparing (same case, punctuation removed,
common company endings like LLC or LTD dropped, accents stripped) so small
spelling differences still turn up. A made-up name should come back empty.

Limits: it is company-name matching only, not proof of anything, and a
close spelling can still be a different company; always check the source
row yourself. Loads all three lists in a few seconds and answers a check in
well under a second.
