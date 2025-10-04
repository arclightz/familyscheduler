'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// TODO: Replace with actual household ID from auth context
const DEMO_HOUSEHOLD_ID = 'demo-household';

interface HouseholdMember {
  id: string;
  user: {
    user_id: string;
    name: string | null;
    email: string;
  };
  role: string;
  capabilities: string[];
  allergies: string[];
}

export default function MembersPage() {
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/households/${DEMO_HOUSEHOLD_ID}`);
        if (!response.ok) {
          throw new Error('Failed to fetch household');
        }
        const data = await response.json();

        // The API returns household with members
        setMembers(data.data?.members || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'parent':
        return 'info' as const;
      case 'teen':
        return 'warning' as const;
      case 'child':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Household Members
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your family members and their capabilities
            </p>
          </div>

          {loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">Loading members...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-600">Error: {error}</p>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <>
              {members.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-gray-500">No members found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member) => (
                    <Card key={member.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {member.user.name || member.user.email}
                            </CardTitle>
                            {member.user.name && (
                              <p className="text-sm text-gray-500 mt-1">
                                {member.user.email}
                              </p>
                            )}
                          </div>
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Capabilities */}
                          {member.capabilities.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Capabilities
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {member.capabilities.map((capability) => (
                                  <Badge
                                    key={capability}
                                    variant="success"
                                    className="text-xs"
                                  >
                                    {capability}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Allergies */}
                          {member.allergies.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Allergies
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {member.allergies.map((allergy) => (
                                  <Badge
                                    key={allergy}
                                    variant="danger"
                                    className="text-xs"
                                  >
                                    {allergy}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {member.capabilities.length === 0 &&
                            member.allergies.length === 0 && (
                              <p className="text-sm text-gray-500 italic">
                                No special requirements
                              </p>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Summary */}
              {members.length > 0 && (
                <Card className="mt-8">
                  <CardHeader>
                    <CardTitle>Household Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {members.length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Total Members
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {
                            members.filter((m) => m.role.toLowerCase() === 'parent')
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Parents
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">
                          {
                            members.filter((m) => m.role.toLowerCase() === 'teen')
                              .length
                          }
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Teens</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {
                            members.filter(
                              (m) => m.capabilities.includes('adult_only')
                            ).length
                          }
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          With Adult Capabilities
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
