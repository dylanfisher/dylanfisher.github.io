# frozen_string_literal: true
#
# Shared by the bin/ generators. Slugs are the single key every list uses
# (data files, image filenames, cross-references), so they must all be
# derived the same way.

def slugify(name)
  s = name.unicode_normalize(:nfkd).encode("ASCII", replace: "").downcase
  s.gsub(/[^a-z0-9]+/, "-").gsub(/^-|-$/, "")
end
